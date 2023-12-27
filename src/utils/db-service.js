// for create one as well as create many
const create = (model, data) => model.create(data);

// update single document that will return updated document
const updateOne = (model, filter, data, options = { new: true }) => model.findOneAndUpdate(filter, data, options);

// delete single document that will return updated document
const deleteOne = (model, filter, options = { new: true }) => model.findOneAndDelete(filter, options);

// update multiple documents and returns count
const updateMany = (model, filter, data) => model.updateMany(filter, data);

// delete multiple documents and returns count
const deleteMany = (model, filter) => model.deleteMany(filter);

// find single document by query
const findOne = (model, filter, options = {}) => model.findOne(filter, options);

// find multiple documents
const findMany = (model, filter, options = {}) => model.find(filter, options);

// count documents
const count = (model, filter) => model.countDocuments(filter);

// find documents with pagination
const paginate = (model, filter, options) => model.paginate(filter, options);

const dbService = {
    create,
    updateOne,
    updateMany,
    deleteOne,
    deleteMany,
    findOne,
    findMany,
    count,
    paginate,
};

export default dbService;
