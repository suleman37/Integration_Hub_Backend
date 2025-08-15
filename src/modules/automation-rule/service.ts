import Odoo from "odoo-xmlrpc"
import { AddAutomationType, UpdateAutomationType } from "./validation";


async function connectOdoo(odoo: any) {
    return new Promise((resolve, reject) => {
        odoo.connect((err: any) => {
            if (err) return reject(`❌ Connection error: ${err.message}`);
            console.log('✅ Connected to Odoo successfully!');
            resolve("");
        });
    });
}


async function executeOdoo(odoo: any, model: string, method: string, params: any = [], options: any = {}) {
    return new Promise((resolve, reject) => {
        odoo.execute_kw(model, method, [params, options], (err: any, result: any) => {
            if (err) return reject(`❌ Error in ${model}.${method}: ${err.faultString}`);
            resolve(result);
        });
    });
}


export const getAutomationRules = async (page: number, limit: number) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070',
            db: 'odoo',
            username: 'admin',
            password: 'admin' // Replace with your actual password or API key
        });
        await connectOdoo(odoo)

        const offset = (page - 1) * limit

        const models: any = await executeOdoo(odoo, 'ir.model', 'search', [[['model', '=', "sale.order"]]])
        const modelId = models[0]

        const webhooks = await executeOdoo(odoo, "ir.actions.server", "search_read",
            [[["model_id", "=", modelId], ["state", "=", "webhook"]]],
            { offset, limit },
        )

        const totalCount = await executeOdoo(
            odoo,
            'ir.actions.server',
            'search_count',
            [[["model_id", "=", modelId], ["state", "=", "webhook"]]],
        );

        const meta = {
            page: page,
            limit: limit,
            totalPage: Math.ceil(totalCount as number / limit),
        }

        return { webhooks, meta }
    } catch (error) {
        throw error
    }
}

export const getAutomationRule = async (id: number) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070',
            db: 'odoo',
            username: 'admin',
            password: 'admin'
        });

        await connectOdoo(odoo)
        return await executeOdoo(odoo, 'ir.actions.server', 'search_read', [[["id", "=", id], ["state", "=", "webhook"]]])
    } catch (error) {
        throw error
    }
}


export const createAutomationRule = async (rule: AddAutomationType) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070',
            db: 'odoo',
            username: 'admin',
            password: 'admin'
        });
        await connectOdoo(odoo)

        const models: any = await executeOdoo(odoo, 'ir.model', 'search', [[['model', '=', rule.model]]])
        const modelId = models[0]

        const body = {
            name: rule.ruleName,
            model_id: modelId,
            state: "webhook",
            binding_type: "action",
            binding_model_id: modelId,
            webhook_url: rule.webhookUrl,
            "webhook_sample_payload": "{ \"order_id\": \"${record.id}\", \"order_name\": \"${record.name}\", \"total_amount\": \"${record.amount_total}\" }",
            "webhook_field_ids": []
        }

        await executeOdoo(odoo, 'ir.actions.server', 'create', [[body]])
    } catch (error) {
        throw error
    }
}


export const updateAutomationRule = async (payload: UpdateAutomationType, id: number) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070',
            db: 'odoo',
            username: 'admin',
            password: 'admin'
        });
        const { connectionRef, ...data } = payload

        await connectOdoo(odoo)
        await executeOdoo(odoo, 'ir.actions.server', 'write', [[id], data])
    } catch (error) {
        throw error
    }
}


export const deleteAutomationRule = async (id: number) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070',
            db: 'odoo',
            username: 'admin',
            password: 'admin'
        });

        await connectOdoo(odoo)
        await executeOdoo(odoo, 'ir.actions.server', 'unlink', [[id]])
    } catch (error) {
        throw error
    }
}



