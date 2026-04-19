
const Employee = require('../model/Employee');

const getAllEmployees = async (req, res) => {
    constemployees = await Employee.find();
    if (!employees) return res.status(204).json({ 'message': 'No employees found.' });
    res.json(employees);
}

const createNewEmployee = async (req, res) => {
    if (!req?.body?.firstname || !req?.body?.lastname) {
        return res.status(400).json({ "message": "First and last names are required." });
    }

    try {
        const result = await Employee.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname
        });
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}

const updateEmployee = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ "message": "ID parameter is required." });
    }

    const employee = await Employee.findById(req.body.id).exec();
    if (!employee) {
        return res.status(204).json({ "message": `No employee with ID ${req.body.id} found.` });
    }
    if (req.body?.firstname) employee.firstname = req.body.firstname;
    if (req.body?.lastname) employee.lastname = req.body.lastname;
    const result = await employee.save();
    res.json(result);
}

const deleteEmployee = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ "message": "ID parameter is required." });
    }

    const employee = await Employee.findById(req.body.id).exec();
    if (!employee) {
        return res.status(204).json({ "message": `No employee with ID ${req.body.id} found.` });
    }

    const result = await employee.remove();
    res.json(result);
}



const getEmployee = async (req, res) => {
    if (req.params?.id) {
        return res.status(400).json({ "message": "ID parameter is required." });
    }
    const employee = await Employee.findById({ _id: req.params.id }).exec();

    if (!employee) {
        return res.status(204).json({ "message": `No employee matches ID ${req.params.id} not found.` });
    }
    res.json(employee);
}



module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee
}