import { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
    // Gateway Layer
    {
        id: 'lb-1',
        type: 'custom',
        position: { x: 400, y: 50 },
        data: { label: 'Load Balancer', type: 'Gateway', icon: '🌐' },
    },
    {
        id: 'api-gateway',
        type: 'custom',
        position: { x: 400, y: 150 },
        data: { label: 'API Gateway', type: 'Gateway', icon: '🛡️' },
    },

    // Service Layer
    {
        id: 'app-server',
        type: 'custom',
        position: { x: 400, y: 300 },
        data: { label: 'Node.js Cluster', type: 'App Server', icon: '🚀' },
    },
    {
        id: 'auth-service',
        type: 'custom',
        position: { x: 200, y: 300 },
        data: { label: 'Auth Service', type: 'Microservice', icon: '🔐' },
    },

    // Processing Utils
    {
        id: 'hasher',
        type: 'custom',
        position: { x: 50, y: 300 },
        data: { label: 'BCrypt Hasher', type: 'Worker', icon: '⚙️' },
    },

    // Data Layer
    {
        id: 'redis-cache',
        type: 'custom',
        position: { x: 600, y: 300 },
        data: { label: 'Redis Store', type: 'Cache', icon: '⚡' },
    },
    {
        id: 'main-db',
        type: 'custom',
        position: { x: 400, y: 450 },
        data: { label: 'PostgreSQL', type: 'Database', icon: '🐘' },
    },
    {
        id: 'shard-1',
        type: 'custom',
        position: { x: 200, y: 450 },
        data: { label: 'DB Shard A', type: 'Shard', icon: '💾' },
    },
    {
        id: 'shard-2',
        type: 'custom',
        position: { x: 600, y: 450 },
        data: { label: 'DB Shard B', type: 'Shard', icon: '💾' },
    },
];

export const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'lb-1', target: 'api-gateway', animated: true },
    { id: 'e2-3', source: 'api-gateway', target: 'app-server' },
    { id: 'e3-4', source: 'app-server', target: 'auth-service' },
    { id: 'e4-5', source: 'auth-service', target: 'hasher' },
    { id: 'e3-6', source: 'app-server', target: 'redis-cache' },
    { id: 'e3-7', source: 'app-server', target: 'main-db' },
];
