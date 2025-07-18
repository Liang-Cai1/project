const express = require('express');
const da = require("./data-access");
const bodyParser = require('body-parser');
const path = require('path');
const checkAPIKey = require("./APIKey").checkAPIKey;
const getNewAPIKey = require("./APIKey").getNewAPIKey;
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get("/APIKey", async (req, res) => {
    let email = req.query.email;
    if(email){
        const newAPIKey = getNewAPIKey(email);
        res.send(newAPIKey);
    }else{
        res.status(400);
        res.send("an email query param is required");
    }   
});

app.get('/customers', checkAPIKey, async (req, res) => {
  try {
    const cust = await da.getCustomers();
    res.send(cust);
  } catch (err) {
    res.status(500).send({ error: err.message || err });
  }
});

app.get("/customers/find/", checkAPIKey, async (req, res) => {
    let id = +req.query.id;
    let email = req.query.email;
    let password = req.query.password;
    let query = null;
    if (id > -1) {
        query = { "id": id };
    } else if (email) {
        query = { "email": email };
    } else if (password) {
        query = { "password": password }
    }
    if (query) {
        const [customers, err] = await da.findCustomers(query);
        if (customers) {
            res.send(customers);
        } else {
            res.status(404);
            res.send(err);
        }
    } else {
        res.status(400);
        res.send("query string is required");
    }
});

app.get("/customers/:id", checkAPIKey, async (req, res) => {
     const id = req.params.id;
     const [cust, err] = await da.getCustomerById(id);
     if(cust){
         res.send(cust);
     }else{
         res.status(404);
         res.send(err);
     }   
});

app.get("/reset", async (req, res) => {
    const [result, err] = await da.resetCustomers();
    if(result){
        res.send(result);
    }else{
        res.status(500);
        res.send(err);
    }   
});

app.post('/customers', checkAPIKey, async (req, res) => {
    const newCustomer = req.body;
    if (!newCustomer || Object.keys(newCustomer).length === 0) {
        res.status(400).send("missing request body");
        return;
    }

    if (!newCustomer.id) {
        res.status(400).send("customer ID is required");
        return;
    }

    const [existingCustomers, err] = await da.findCustomers({ id: newCustomer.id });
    if (existingCustomers && existingCustomers.length > 0) {
        res.status(409).send(`Customer with ID ${newCustomer.id} already exists.`);
        return;
    }

    const [status, id, errMessage] = await da.addCustomer(newCustomer);

    if (status === "success") {
        res.status(201);
        let response = { ...newCustomer };
        response["_id"] = id;
        res.send(response);
    } else {
        res.status(400);
        res.send(errMessage);
    }
});

app.put('/customers/:id', checkAPIKey, async (req, res) => {
    const id = req.params.id;
    const updatedCustomer = req.body;
    if (updatedCustomer === null || req.body == {}) {
        res.status(400);
        res.send("missing request body");
    } else {
        delete updatedCustomer._id;
        const [message, errMessage] = await da.updateCustomer(updatedCustomer);
        if (message) {
            res.send(message);
        } else {
            res.status(400);
            res.send(errMessage);
        }
    }
});

app.delete("/customers/:id", checkAPIKey, async (req, res) => {
    const id = req.params.id;
    const [message, errMessage] = await da.deleteCustomerById(id);
    if (message) {
        res.send(message);
    } else {
        res.status(404);
        res.send(errMessage);
    }
});