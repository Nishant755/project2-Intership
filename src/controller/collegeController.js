// const mongoose = require("mongoose");
const collegeModels = require("../Models/collegeModels");
// const internModels = require("../models/internModels");
// const validator = require("validator");

const createCollege = async function (req, res) {
  const isValid = function (value) {
    if (typeof value == "undefined" || value == null) return false; //Here it Checks that Is there value is null or undefined
    if (typeof value === "string" && value.trim().length === 0) return false; // Here it Checks that Value contain only Space
    return true;
  };
  const isValidReqBody = function (body) {
    //  console.log(body)
    return Object.keys(body).length > 0; // it Checks Any Key is Present or not
  };

  try {
    let data = req.body;
    const { name, fullName, logoLink, isDeleted } = data;

    //---------------------VALIDATION STARTS-----------------------------//

    if (!isValidReqBody(data))
      return res.status(400).send({
        status: false,
        message: "Please Enter Valid College Details To Create College",
      });

    if (!isValid(name))
      return res.status(400).send({
        status: false,
        message: "Please Provide College Name To Create College",
      });

    if (/^[a-zA-Z]+$/.test(name) == false)
      return res
        .status(400)
        .send({ status: false, message: "name can not be a number" });

    if (!isValid(logoLink))
      return res
        .status(400)
        .send({ status: false, message: "Please Provide Logo Link" });

    if (/^[a-zA-Z ]+$/.test(fullName) == false)
      return res
        .status(400)
        .send({ status: false, message: "Fullname can not be a number" });

    if (!isValid(fullName))
      return res.status(400).send({
        status: false,
        message: "Please Provide College Full Name To Create College",
      });
    if (isDeleted == true)
      return res.status(400).send({
        status: false,
        msg: "College Details has been already Deleted",
      });
    if (typeof (isDeleted !== "boolean"))
      return res.status(400).send({
        status: false,
        msg: "isDeleted should be Boolean type",
      });

    //Unique items
    const duplicatefullNames = await collegeModels.findOne({ name: name });

    if (duplicatefullNames)
      return res.status(400).send({ message: `${name} is Already Exists` });
    //-----------------------------------VALIDATION ENDS----------------------------------------//

    const collegeData = { name, fullName, logoLink, isDeleted };

    const collegeInfo = await collegeModels.create(collegeData);
    res.status(201).send({
      status: true,
      message: "College Created Successfully",
      data: collegeInfo,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
module.exports.createCollege = createCollege;
