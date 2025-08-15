
export async function connectOdoo(odoo: any) {
    try {
        return new Promise((resolve, reject) => {
            odoo.connect((err: any) => {
                if (err) return reject(`❌ Connection error: ${err.message}`);
                console.log('✅ Connected to Odoo successfully!');
                resolve("");
            });
        })
    } catch (error) {
        throw error
    }
}


export async function executeOdoo(odoo: any, model: string, method: string, params: any = [], options: any = {}) {
    try {
        return new Promise((resolve, reject) => {
            odoo.execute_kw(model, method, [params, options], (err: any, result: any) => {
                if (err) return reject(`❌ Error in ${model}.${method}: ${err.faultString}`);
                resolve(result);
            });
        })
    } catch (error) {
        throw error
    }
}



