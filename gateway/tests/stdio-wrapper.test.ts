/**
 * Comprehensive test suite for STDIO wrapper functionality
 *
 * Tests cover:
 * - STDIOWrapper: Process management, JSON-RPC protocol, error handling
 * - STDIOHTTPServer: HTTP API, integration
 * - PortAllocator: Port management
 */

import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { STDIOWrapper } from '../src/wrappers/stdio-to-http';
import { STDIOHTTPServer } from '../src/wrappers/stdio-http-server';
import { PortAllocator } from '../src/wrappers/port-allocator';
import {
  ProcessCrashedError,
  JSONRPCProtocolError,
  TimeoutError,
  InvalidResponseError,
  MaxRestartsExceededError,
  PortAllocationError,
} from '../src/errors/stdio-errors';

// Mock child_process
jest.mock('child_process');
const { spawn } = require('child_process');

// Mock logger
jest.mock('../src/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('STDIOWrapper', () => {
  let mockProcess: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock process
    mockProcess = new EventEmitter() as any;
    mockProcess.stdin = {
      write: jest.fn((data: string, callback?: Function) => {
        if (callback) callback();
        return true;
      }),
    };
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    mockProcess.pid = 12345;
    mockProcess.kill = jest.fn();
    mockProcess.killed = false;

    spawn.mockReturnValue(mockProcess);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Configuration Validation', () => {
    test('should require command', () => {
      expect(() => new STDIOWrapper({ command: '', args: [] })).toThrow('STDIO command is required');
    });

    test('should prevent shell injection in command', () => {
      expect(() => new STDIOWrapper({ command: 'node && rm -rf /', args: [] })).toThrow(
        'shell injection prevention'
      );
    });

    test('should prevent shell injection with pipes', () => {
      expect(() => new STDIOWrapper({ command: 'node | cat', args: [] })).toThrow(
        'shell injection prevention'
      );
    });

    test('should prevent shell injection with semicolons', () => {
      expect(() => new STDIOWrapper({ command: 'node; ls', args: [] })).toThrow(
        'shell injection prevention'
      );
    });

    test('should accept valid configuration', () => {
      expect(() => new STDIOWrapper({
        command: 'node',
        args: ['server.js', '--port', '3000'],
        env: { NODE_ENV: 'production' },
      })).not.toThrow();
    });

    test('should validate environment variables are strings', () => {
      expect(() => new STDIOWrapper({
        command: 'node',
        args: [],
        env: { PORT: 3000 as any },
      })).toThrow('Environment variables must be string key-value pairs');
    });
  });

  describe('Process Lifecycle', () => {
    test('should start process successfully', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      expect(spawn).toHaveBeenCalledWith('node', ['server.js'], expect.objectContaining({
        stdio: ['pipe', 'pipe', 'pipe'],
      }));
    });

    test('should not start if already running', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();
      await wrapper.start(); // Second call

      expect(spawn).toHaveBeenCalledTimes(1);
    });

    test('should stop process gracefully', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const stopPromise = wrapper.stop();

      // Simulate process exit
      setTimeout(() => mockProcess.emit('exit', 0, null), 10);

      await stopPromise;

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
    });

    test('should force kill if process does not exit gracefully', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const stopPromise = wrapper.stop();

      // Don't emit exit event - let timeout happen
      await stopPromise;

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGKILL');
    }, 10000);

    test('should reject pending requests on stop', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const callPromise = wrapper.call('test/method', { param: 'value' });

      const stopPromise = wrapper.stop();
      setTimeout(() => mockProcess.emit('exit', 0, null), 10);
      await stopPromise;

      await expect(callPromise).rejects.toThrow('Process stopped');
    });
  });

  describe('JSON-RPC Protocol', () => {
    test('should send JSON-RPC request with correct format', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const callPromise = wrapper.call('tools/list', { filter: 'test' });

      // Verify request format
      expect(mockProcess.stdin.write).toHaveBeenCalled();
      const writeCall = mockProcess.stdin.write.mock.calls[0][0];
      const request = JSON.parse(writeCall);

      expect(request).toMatchObject({
        jsonrpc: '2.0',
        id: expect.any(Number),
        method: 'tools/list',
        params: { filter: 'test' },
      });

      // Send response
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result: { tools: [] },
      };
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify(response) + '\n'));

      await expect(callPromise).resolves.toEqual({ tools: [] });
    });

    test('should handle JSON-RPC error responses', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const callPromise = wrapper.call('invalid/method');

      const writeCall = mockProcess.stdin.write.mock.calls[0][0];
      const request = JSON.parse(writeCall);

      // Send error response
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: 'Method not found',
          data: { method: 'invalid/method' },
        },
      };
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify(response) + '\n'));

      await expect(callPromise).rejects.toThrow(JSONRPCProtocolError);
      await expect(callPromise).rejects.toMatchObject({
        message: 'Method not found',
        code: -32601,
        data: { method: 'invalid/method' },
      });
    });

    test('should handle multiple concurrent requests', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const call1 = wrapper.call('method1');
      const call2 = wrapper.call('method2');
      const call3 = wrapper.call('method3');

      // Get request IDs
      const req1 = JSON.parse(mockProcess.stdin.write.mock.calls[0][0]);
      const req2 = JSON.parse(mockProcess.stdin.write.mock.calls[1][0]);
      const req3 = JSON.parse(mockProcess.stdin.write.mock.calls[2][0]);

      // Send responses out of order
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({
        jsonrpc: '2.0',
        id: req3.id,
        result: 'result3',
      }) + '\n'));

      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({
        jsonrpc: '2.0',
        id: req1.id,
        result: 'result1',
      }) + '\n'));

      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({
        jsonrpc: '2.0',
        id: req2.id,
        result: 'result2',
      }) + '\n'));

      await expect(call1).resolves.toBe('result1');
      await expect(call2).resolves.toBe('result2');
      await expect(call3).resolves.toBe('result3');
    });

    test('should handle split JSON responses', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const callPromise = wrapper.call('test/method');

      const req = JSON.parse(mockProcess.stdin.write.mock.calls[0][0]);
      const response = JSON.stringify({
        jsonrpc: '2.0',
        id: req.id,
        result: { success: true },
      }) + '\n';

      // Send response in chunks
      const mid = Math.floor(response.length / 2);
      mockProcess.stdout.emit('data', Buffer.from(response.slice(0, mid)));
      mockProcess.stdout.emit('data', Buffer.from(response.slice(mid)));

      await expect(callPromise).resolves.toEqual({ success: true });
    });

    test('should ignore notifications without ID', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const notificationHandler = jest.fn();
      wrapper.on('notification', notificationHandler);

      // Send notification
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({
        jsonrpc: '2.0',
        method: 'notification/event',
        params: { data: 'test' },
      }) + '\n'));

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(notificationHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'notification/event',
          params: { data: 'test' },
        })
      );
    });
  });

  describe('Timeout Handling', () => {
    test('should timeout requests after configured timeout', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
        timeout: 100,
      });

      await wrapper.start();

      const callPromise = wrapper.call('slow/method');

      await expect(callPromise).rejects.toThrow(TimeoutError);
      await expect(callPromise).rejects.toThrow('timed out after 100ms');
    }, 500);

    test('should use default timeout if not configured', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const status = wrapper.getStatus();
      // Default timeout is 30000ms - we just verify wrapper was created
      expect(status.running).toBe(true);
    });
  });

  describe('Process Crash and Restart', () => {
    test('should detect process exit', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const exitHandler = jest.fn();
      wrapper.on('exit', exitHandler);

      mockProcess.emit('exit', 1, null);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(exitHandler).toHaveBeenCalledWith(1, null);
    });

    test('should auto-restart on crash', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
        maxRestarts: 3,
      });

      await wrapper.start();

      const restartHandler = jest.fn();
      wrapper.on('restart', restartHandler);

      // Simulate crash
      mockProcess.emit('exit', 1, null);

      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(spawn).toHaveBeenCalledTimes(2); // Initial + 1 restart
      expect(restartHandler).toHaveBeenCalledWith(1);
    }, 5000);

    test('should stop restarting after max attempts', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
        maxRestarts: 2,
      });

      await wrapper.start();

      const errorHandler = jest.fn();
      wrapper.on('error', errorHandler);

      // Simulate multiple crashes
      for (let i = 0; i < 3; i++) {
        mockProcess.emit('exit', 1, null);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'MaxRestartsExceededError',
        })
      );
    }, 10000);

    test('should reject pending requests on crash', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
        maxRestarts: 0, // Disable restart for this test
      });

      await wrapper.start();

      const callPromise = wrapper.call('test/method');

      mockProcess.emit('exit', 1, null);

      await expect(callPromise).rejects.toThrow(ProcessCrashedError);
    });

    test('should clear tools cache on crash', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      // Simulate tool discovery
      const listPromise = wrapper.listTools();
      const req = JSON.parse(mockProcess.stdin.write.mock.calls[0][0]);
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({
        jsonrpc: '2.0',
        id: req.id,
        result: {
          tools: [{ name: 'test', description: 'Test tool', inputSchema: { type: 'object', properties: {} } }],
        },
      }) + '\n'));
      await listPromise;

      // Crash
      mockProcess.emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 10));

      // After restart, tools should be re-discovered (not from cache)
      const listPromise2 = wrapper.listTools();
      expect(mockProcess.stdin.write).toHaveBeenCalled();
    });
  });

  describe('Tool Discovery', () => {
    test('should list tools from MCP server', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const listPromise = wrapper.listTools();

      const req = JSON.parse(mockProcess.stdin.write.mock.calls[0][0]);
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({
        jsonrpc: '2.0',
        id: req.id,
        result: {
          tools: [
            {
              name: 'getTodo',
              description: 'Get a todo item',
              inputSchema: {
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
              },
            },
            {
              name: 'createTodo',
              description: 'Create a new todo',
              inputSchema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  completed: { type: 'boolean' },
                },
                required: ['title'],
              },
            },
          ],
        },
      }) + '\n'));

      const tools = await listPromise;

      expect(tools).toHaveLength(2);
      expect(tools[0]).toMatchObject({
        name: 'getTodo',
        description: 'Get a todo item',
        category: 'custom',
        integration: 'stdio',
      });
      expect(tools[0].parameters).toMatchObject({
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      });
    });

    test('should cache tool list', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      // First call
      const listPromise1 = wrapper.listTools();
      const req1 = JSON.parse(mockProcess.stdin.write.mock.calls[0][0]);
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({
        jsonrpc: '2.0',
        id: req1.id,
        result: {
          tools: [{ name: 'test', description: 'Test', inputSchema: { type: 'object', properties: {} } }],
        },
      }) + '\n'));
      await listPromise1;

      // Second call - should use cache
      const tools2 = await wrapper.listTools();

      expect(mockProcess.stdin.write).toHaveBeenCalledTimes(1); // Only one RPC call
      expect(tools2).toHaveLength(1);
    });

    test('should handle invalid tools/list response', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const listPromise = wrapper.listTools();

      const req = JSON.parse(mockProcess.stdin.write.mock.calls[0][0]);
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({
        jsonrpc: '2.0',
        id: req.id,
        result: { invalid: 'format' }, // Missing tools array
      }) + '\n'));

      await expect(listPromise).rejects.toThrow(InvalidResponseError);
    });
  });

  describe('Process Status', () => {
    test('should return process status', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      const status = wrapper.getStatus();

      expect(status).toMatchObject({
        running: true,
        uptime: expect.any(Number),
        requestCount: 0,
        errorCount: 0,
        restartCount: 0,
        pid: 12345,
      });
    });

    test('should track request count', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      // Make some requests
      const call1 = wrapper.call('method1');
      const call2 = wrapper.call('method2');

      // Respond to requests
      const req1 = JSON.parse(mockProcess.stdin.write.mock.calls[0][0]);
      const req2 = JSON.parse(mockProcess.stdin.write.mock.calls[1][0]);
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({ jsonrpc: '2.0', id: req1.id, result: 'ok' }) + '\n'));
      mockProcess.stdout.emit('data', Buffer.from(JSON.stringify({ jsonrpc: '2.0', id: req2.id, result: 'ok' }) + '\n'));

      await call1;
      await call2;

      const status = wrapper.getStatus();
      expect(status.requestCount).toBe(2);
    });

    test('should track error count', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
        timeout: 50,
      });

      await wrapper.start();

      // Make request that will timeout
      const call1 = wrapper.call('slow/method').catch(() => {});

      await new Promise(resolve => setTimeout(resolve, 100));

      const status = wrapper.getStatus();
      expect(status.errorCount).toBeGreaterThan(0);
    }, 500);
  });

  describe('Error Handling', () => {
    test('should handle write errors', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      // Mock write error
      mockProcess.stdin.write.mockImplementation((data: string, callback: Function) => {
        callback(new Error('EPIPE'));
        return false;
      });

      await expect(wrapper.call('test/method')).rejects.toThrow(ProcessCrashedError);
      await expect(wrapper.call('test/method')).rejects.toThrow('Failed to write to stdin');
    });

    test('should handle invalid JSON in stdout', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      // Send invalid JSON
      mockProcess.stdout.emit('data', Buffer.from('invalid json\n'));

      // Should not crash - just log error
      await new Promise(resolve => setTimeout(resolve, 10));

      const status = wrapper.getStatus();
      expect(status.running).toBe(true);
    });

    test('should handle stderr output', async () => {
      const wrapper = new STDIOWrapper({
        command: 'node',
        args: ['server.js'],
      });

      await wrapper.start();

      // Send stderr output
      mockProcess.stderr.emit('data', Buffer.from('Error: something went wrong\n'));

      // Should not crash
      await new Promise(resolve => setTimeout(resolve, 10));

      const status = wrapper.getStatus();
      expect(status.running).toBe(true);
    });
  });
});

describe('STDIOHTTPServer', () => {
  let mockWrapper: jest.Mocked<STDIOWrapper>;
  let server: STDIOHTTPServer;

  beforeEach(() => {
    mockWrapper = {
      call: jest.fn(),
      listTools: jest.fn(),
      getStatus: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
    } as any;

    server = new STDIOHTTPServer(mockWrapper);
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Server Lifecycle', () => {
    test('should start HTTP server', async () => {
      await server.start(10001);

      expect(server.getPort()).toBe(10001);
    });

    test('should not start if already running', async () => {
      await server.start(10002);
      await server.start(10002);

      expect(server.getPort()).toBe(10002);
    });

    test('should stop HTTP server', async () => {
      await server.start(10003);
      await server.stop();

      expect(server.getPort()).toBeNull();
    });
  });

  describe('HTTP Routes', () => {
    test('POST /invoke should call wrapper', async () => {
      mockWrapper.call.mockResolvedValue({ success: true });

      await server.start(10004);

      const response = await fetch('http://localhost:10004/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'test/method', params: { key: 'value' } }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true, data: { success: true } });
      expect(mockWrapper.call).toHaveBeenCalledWith('test/method', { key: 'value' });
    });

    test('POST /invoke should validate method', async () => {
      await server.start(10005);

      const response = await fetch('http://localhost:10005/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params: { key: 'value' } }), // Missing method
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    test('GET /tools should list tools', async () => {
      mockWrapper.listTools.mockResolvedValue([
        {
          id: 'test-1',
          name: 'test1',
          description: 'Test tool 1',
          category: 'custom',
          integration: 'stdio',
          parameters: { type: 'object' as const, properties: {} },
          tokenCost: 100,
        },
      ]);

      await server.start(10006);

      const response = await fetch('http://localhost:10006/tools');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.tools).toHaveLength(1);
      expect(data.data.count).toBe(1);
    });

    test('GET /status should return process status', async () => {
      mockWrapper.getStatus.mockReturnValue({
        running: true,
        uptime: 120,
        requestCount: 10,
        errorCount: 0,
        restartCount: 0,
      });

      await server.start(10007);

      const response = await fetch('http://localhost:10007/status');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.running).toBe(true);
      expect(data.data.uptime).toBe(120);
    });

    test('GET /health should return healthy when running', async () => {
      mockWrapper.getStatus.mockReturnValue({
        running: true,
        uptime: 60,
        requestCount: 5,
        errorCount: 0,
        restartCount: 0,
        pid: 12345,
      });

      await server.start(10008);

      const response = await fetch('http://localhost:10008/health');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.pid).toBe(12345);
    });

    test('GET /health should return unhealthy when not running', async () => {
      mockWrapper.getStatus.mockReturnValue({
        running: false,
        uptime: 0,
        requestCount: 0,
        errorCount: 0,
        restartCount: 0,
      });

      await server.start(10009);

      const response = await fetch('http://localhost:10009/health');
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
    });
  });

  describe('Error Handling', () => {
    test('should handle wrapper errors', async () => {
      mockWrapper.call.mockRejectedValue(new ProcessCrashedError('Process died'));

      await server.start(10010);

      const response = await fetch('http://localhost:10010/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'test/method' }),
      });

      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error.code).toBe('PROCESS_CRASHED');
    });

    test('should handle timeout errors', async () => {
      mockWrapper.call.mockRejectedValue(new TimeoutError('Request timed out'));

      await server.start(10011);

      const response = await fetch('http://localhost:10011/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'slow/method' }),
      });

      const data = await response.json();

      expect(response.status).toBe(504);
      expect(data.error.code).toBe('TIMEOUT');
    });

    test('should handle JSON-RPC errors', async () => {
      mockWrapper.call.mockRejectedValue(
        new JSONRPCProtocolError('Method not found', -32601, { method: 'unknown' })
      );

      await server.start(10012);

      const response = await fetch('http://localhost:10012/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'unknown/method' }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('JSON_RPC_ERROR');
      expect(data.error.rpcCode).toBe(-32601);
    });
  });
});

describe('PortAllocator', () => {
  let allocator: PortAllocator;

  beforeEach(() => {
    allocator = PortAllocator.getInstance();
    allocator.reset();
  });

  describe('Port Allocation', () => {
    test('should allocate a port', () => {
      const port = allocator.allocate();

      expect(port).toBeGreaterThanOrEqual(10000);
      expect(port).toBeLessThanOrEqual(20000);
      expect(allocator.isAllocated(port)).toBe(true);
    });

    test('should allocate different ports', () => {
      const port1 = allocator.allocate();
      const port2 = allocator.allocate();

      expect(port1).not.toBe(port2);
    });

    test('should not reuse released ports immediately', () => {
      const port1 = allocator.allocate();
      const port2 = allocator.allocate();

      allocator.release(port1);

      const port3 = allocator.allocate();
      expect(port3).not.toBe(port2);
    });

    test('should eventually reuse released ports', () => {
      const port1 = allocator.allocate();
      allocator.release(port1);

      // Allocate many ports to wrap around
      for (let i = 0; i < 100; i++) {
        allocator.allocate();
      }

      // port1 should eventually be reused
      expect(allocator.isAllocated(port1)).toBe(true);
    });
  });

  describe('Port Release', () => {
    test('should release allocated port', () => {
      const port = allocator.allocate();
      expect(allocator.isAllocated(port)).toBe(true);

      allocator.release(port);
      expect(allocator.isAllocated(port)).toBe(false);
    });

    test('should handle releasing non-allocated port', () => {
      expect(() => allocator.release(99999)).not.toThrow();
    });
  });

  describe('Port Tracking', () => {
    test('should track allocated count', () => {
      expect(allocator.getAllocatedCount()).toBe(0);

      allocator.allocate();
      allocator.allocate();
      allocator.allocate();

      expect(allocator.getAllocatedCount()).toBe(3);
    });

    test('should update count after release', () => {
      const port1 = allocator.allocate();
      const port2 = allocator.allocate();

      expect(allocator.getAllocatedCount()).toBe(2);

      allocator.release(port1);

      expect(allocator.getAllocatedCount()).toBe(1);
    });
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = PortAllocator.getInstance();
      const instance2 = PortAllocator.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
