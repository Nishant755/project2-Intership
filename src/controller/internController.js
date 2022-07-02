const internModel = require("../Models/internModels");
const collegeModel = require("../Models/collegeModels");
const validator = require("validator");

const createIntern = async function (req, res) {
  const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };
  const isValidBody = function (body) {
    return Object.keys(body).length > 0;
  };

  try {
    let requestBody = req.body;
    //-----------------------------VALIDATION START-----------------------------------//
    if (!isValidBody(requestBody))
      return res
        .status(400)
        .send({ status: false, msg: "Please provide intern details" });
    //extracting body keys
    const { name, email, mobile, collegeName, isDeleted } = requestBody;
    //for valid name
    if (!isValid(name))
      return res
        .status(400)
        .send({ status: false, message: "Please provide name" });

    if (/^[a-zA-Z]+$/.test(name) == false)
      return res.status(400).send({
        status: false,
        message: "Please provide only Alphabets in name",
      });

    //for valid email
    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "Please provide email" });

    if (validator.isEmail(email) === false)
      return res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });

    //for valid mobile
    if (!isValid(mobile))
      return res
        .status(400)
        .send({ status: false, message: "Please provide mobile" });
    if (typeof mobile === "string")
      return res
        .status(400)
        .send({ status: false, message: "Please provide in number format" });

    if (String(mobile).length !== 10)
      return res.status(400).send({
        status: false,
        message: `${String(mobile).length} digit is not a valid for Mobile`,
      });

    if (!isValid(collegeName))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid collegeName." });

    if (isDeleted == true)
      return res.status(400).send({
        status: false,
        msg: "Intern Details has been already Deleted",
      });

    //for unique items;-
    const isNumberAlreadyUsed = await internModel.findOne({ mobile });
    if (isNumberAlreadyUsed)
      return res.status(400).send({
        status: false,
        message: `${mobile} number is already registered`,
      });

    const isEmailAlreadyUsed = await internModel.findOne({ email });
    if (isEmailAlreadyUsed)
      return res.status(400).send({
        status: false,
        message: `${email} email is already registered`,
      });

    //-------------------------VALIDATION ENDS-------------------------------//

    //checking college name by finding in college collection
    let CollegeID = req.body.collegeName;
    let collegeData = await collegeModel.findOne({ name: CollegeID });
    if (!collegeData)
      return res.status(400).send({
        status: false,
        message: `${CollegeID} is not a valid college name `,
      });

    const validCollegeID = collegeData._id;

    //collection all the data and storing it in a varibale
    const internData = {
      isDeleted,
      name,
      email,
      mobile,
      collegeId: validCollegeID,
    };

    internModel.create(internData);
    return res.status(201).send({
      status: true,
      message: `Intern created successfully`,
      data: internData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports.createIntern = createIntern;

const getCollegeDetails = async function (req, res) {
  try {
    let queryData = req.query;

    if (Object.keys(queryData).length == 0) {
      return res
        .status(400)
        .send({ status: false, msg: "please enter data in query" });
    }
    if (!queryData.name) {
      return res.status(400).send("Oops! key have empty space or invalid name");
    }
    //************************DB CALL************************/
    let collegeData = await collegeModel
      .findOne({ name: queryData.name })
      .select({ name: 1, fullName: 1, logoLink: 1, isDeleted: 1 });
    if (!collegeData)
      return res
        .status(404)
        .send({ status: false, msg: "Oops! data not found" }); // if wrong entry
    let collegeId = collegeData._id.valueOf();
    let internData = await internModel.find({ collegeId: collegeId });
    if (internData.length == 0) {
      return res
        .status(404)
        .send({ status: false, msg: "Sorry! no intern for this college" });
    }
    //********************** Destructuring********************************/
    let data = {
      name: collegeData.name,
      fullName: collegeData.fullName,
      logoLink: collegeData.logoLink,
      isDeleted: collegeData.isDeleted,
      intern: internData,
    };
    res.status(200).send({ data: data });
  } catch (err) {
    res.status(500).send({ status: false, Error: err.message });
  }
};

module.exports.getCollegeDetails = getCollegeDetails;