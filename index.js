import * as fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";
import Manager from "./lib/Manager.js";
import Engineer from "./lib/Engineer.js";
import Intern from "./lib/Intern.js";
import render from "./src/page-template.js";

// ES Modules usage means __dirname needs to be explicitly specified
const __dirname = import.meta.dirname;
const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

// TODO: Write Code to gather information about the development team members, and render the HTML file.

// IIFE as entry point for user
(async () => {
  // Create team object to populate through various user interactions
  const team = [];

  // Team manager is explicitly requested first as a requirement of the program
  console.log("Please begin by providing some details for the team manager");
  const manager = await createEmployee("manager");
  team.push(manager);

  const menuOptions = [
    "Add an engineer",
    "Add an intern",
    "Finish building the team",
  ];
  let menuChoice;

  // Ask user for an option until they choose that they are finished
  while (
    (menuChoice = await getMenuChoice(menuOptions)) !==
    "Finish building the team"
  ) {
    if (menuChoice === "Add an engineer") {
      const engineer = await createEmployee("engineer");
      team.push(engineer);
    } else if (menuChoice === "Add an intern") {
      const intern = await createEmployee("intern");
      team.push(intern);
    }
  }

  // render takes array of team members and generates html from it
  const html = render(team);

  // create the output directory (in case it does not exist) before writing to it
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(outputPath, html);
})();

async function getMenuChoice(choices) {
  const { response } = await inquirer.prompt([
    {
      type: "list",
      name: "response",
      message: "Please select an option",
      choices,
    },
  ]);

  return response;
}

async function createEmployee(employeeType) {
  // map of all the potential fields an employee can have and how they correspond to the various employee types
  const employeeFields = {
    name: {
      type: "input",
      employees: ["manager", "engineer", "intern"],
    },
    employeeID: {
      type: "number",
      employees: ["manager", "engineer", "intern"],
    },
    emailAddress: {
      type: "input",
      employees: ["manager", "engineer", "intern"],
    },
    officeNumber: {
      type: "number",
      employees: ["manager"],
    },
    githubUsername: {
      type: "input",
      employees: ["engineer"],
    },
    school: {
      type: "input",
      employees: ["intern"],
    },
  };

  const employeeDetails = {
    employeeType,
  };

  for (const [fieldName, fieldProperties] of Object.entries(employeeFields)) {
    // If the employeeType is a valid recipient of this question, ask the question
    if (fieldProperties.employees.includes(employeeType)) {
      // destructure response from inquirer.prompt resolution value
      const { response } = await inquirer.prompt([
        {
          type: fieldProperties.type,
          name: "response",
          message: `Please provide a ${fieldName} for the ${employeeType}`,
        },
      ]);

      // Add value to employee object
      employeeDetails[fieldName] = response;
    }
  }

  return instantiateEmployee(employeeDetails);
}

function instantiateEmployee(employeeDetails) {
  // Instantiate appropriate employee based on the provided type
  switch (employeeDetails.employeeType) {
    case "manager":
      return new Manager(
        employeeDetails.name,
        employeeDetails.employeeID,
        employeeDetails.emailAddress,
        employeeDetails.officeNumber
      );
    case "engineer":
      return new Engineer(
        employeeDetails.name,
        employeeDetails.employeeID,
        employeeDetails.emailAddress,
        employeeDetails.githubUsername
      );
    case "intern":
      return new Intern(
        employeeDetails.name,
        employeeDetails.employeeID,
        employeeDetails.emailAddress,
        employeeDetails.school
      );
  }
}
