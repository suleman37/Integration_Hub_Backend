import { addConnectionCheckingJob, connectionQueue } from "../job/connection_queue";
import { User } from "../modules/user";

export async function restartUserJob() {
    let page = 1
    const limit = 20

    while (1) {
        const offset = ((page - 1) * limit)
        let users = await User.find().skip(offset).limit(limit)
        if (users.length === 0) {
            break
        }

        for (let i = 0; i < users.length; i++) {
            const job = await connectionQueue.getJob(`connection-sync-${users[i].uuid}`)
            if (!job) {
                await addConnectionCheckingJob({ userId: users[i].uuid });
                continue
            }

            const state = await job.getState();
            if (state !== 'active') {
                await addConnectionCheckingJob({ userId: users[i].uuid });
            }
        }

        page += 1
    }
}


