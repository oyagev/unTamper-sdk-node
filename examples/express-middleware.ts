import express from 'express';
import { UnTamperClient } from '@untamper/sdk-node';

// Initialize the client
const client = new UnTamperClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000', // For development
});

// Express middleware for automatic audit logging
function auditLogMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function(body: any) {
    const duration = Date.now() - startTime;
    
    // Log the request asynchronously (don't wait for it)
    logRequest(req, res, duration).catch(error => {
      console.error('Failed to log request:', error);
    });

    return originalSend.call(this, body);
  };

  next();
}

async function logRequest(req: express.Request, res: express.Response, duration: number) {
  try {
    // Extract user information from request (adjust based on your auth system)
    const userId = (req as any).user?.id || 'anonymous';
    const userType = (req as any).user ? 'user' : 'system';
    const userName = (req as any).user?.name || 'Anonymous User';

    // Determine the action based on HTTP method and route
    const action = `${req.method.toLowerCase()}.${req.route?.path || req.path.replace(/\//g, '.')}`;
    
    // Determine result based on status code
    let result: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ERROR' = 'SUCCESS';
    if (res.statusCode >= 400 && res.statusCode < 500) {
      result = 'DENIED';
    } else if (res.statusCode >= 500) {
      result = 'ERROR';
    }

    await client.logs.ingestLog({
      action,
      actor: {
        id: userId,
        type: userType,
        display_name: userName,
      },
      result,
      context: {
        request_id: req.headers['x-request-id'] as string || `req_${Date.now()}`,
        method: req.method,
        url: req.url,
        user_agent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        status_code: res.statusCode,
        duration_ms: duration,
      },
      metadata: {
        middleware: 'express-audit-log',
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error('Error in audit log middleware:', error);
  }
}

// Example Express app
const app = express();

// Use the middleware
app.use(auditLogMiddleware);

// Example routes
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  res.status(201).json({ id: 'user123', name: 'John Doe' });
});

app.get('/api/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'John Doe' });
});

app.put('/api/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Updated Name' });
});

app.delete('/api/users/:id', (req, res) => {
  res.status(204).send();
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Audit logging is enabled for all requests');
});
