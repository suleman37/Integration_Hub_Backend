import { HttpStatusCode } from "../../config/auth";
import { AppError } from "../../error";
import Adaptor from "./model";
import { AddAdaptorPayload, UpdateAdaptorPayload } from "./validation";


export const getAdaptors = async (page: number, limit: number) => {
    try {
        const offset = ((page - 1) * limit)
        const adaptors = await Adaptor.find().skip(offset).limit(limit)
        const totalAdaptors = await Adaptor.countDocuments();

        const meta = {
            page: page,
            limit: limit,
            totalPage: Math.ceil(totalAdaptors / limit),
        }

        return { adaptors, meta }
    } catch (error) {
        throw error
    }
}


export const getAdaptor = async (id: string) => {
    try {
        const adaptor = await Adaptor.findOne({ uuid: id })
        if (!adaptor) {
            throw new AppError("Adaptor does not exists", HttpStatusCode.BadRequest);
        }

        return adaptor
    } catch (error) {
        throw error
    }
}


export const createAdaptor = async (payload: AddAdaptorPayload) => {
    try {
        const adaptorExists = await Adaptor.findOne({ name: payload.name });
        if (adaptorExists) {
            throw new AppError("Adaptor already exists", HttpStatusCode.BadRequest);
        }

        const uuid = crypto.randomUUID()
        const newAdaptor = {
            uuid: uuid,
            ...payload,
        }

        await Adaptor.create(newAdaptor);
    } catch (error) {
        throw error
    }
}


export const updateAdaptor = async (payload: UpdateAdaptorPayload, id: string) => {
    try {
        const result = await Adaptor.updateOne({ "uuid": id }, { "$set": payload });
        if (result.matchedCount === 0) {
            throw new AppError("Adaptor does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}


export const deleteAdaptor = async (id: string) => {
    try {
        const result = await Adaptor.deleteOne({ "uuid": id })
        if (result.deletedCount === 0) {
            throw new AppError("Adaptor does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}



