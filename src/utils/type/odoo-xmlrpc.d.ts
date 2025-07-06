declare module 'odoo-xmlrpc' {
    export default class Odoo {
        constructor(config: { url: string; port?: number; db: string; username: string; password: string });
        connect(callback: (err: any, res: any) => void): void;
        execute_kw(model: string, method: string, params: any[], callback: (err: any, res: any) => void): void;
    }
}

