const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");

const Project = require("../models/Project");
const Task = require("../models/Task");

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate(["user", "tasks"]);
    res.send(projects);
  } catch (err) {
    return res.status(400).send({ error: "Error listing projects" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const projects = await Project.findById(req.params.id).populate([
      "user",
      "tasks",
    ]);
    res.send(projects);
  } catch (err) {
    return res.status(400).send({ error: "Error getting project" });
  }
});
router.post("/", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;
    const project = await Project.create({
      title,
      description,
      user: req.userId,
    });

    await Promise.all(
      tasks.map(async (task) => {
        const projectTask = new Task({
          ...task,
          assignedTo: req.userId,
          project: project._id,
        });
        await projectTask.save();
        project.tasks.push(projectTask);
      })
    );
    await project.save();
    res.send(project);
  } catch (err) {
    return res
      .status(400)
      .send({ error: "Error creating project", message: err });
  }
});
router.put("/:id", async (req, res) => {
  res.send({ id: req.userId });
});
router.delete("/:id", async (req, res) => {
  try {
    if (req.params.id == "all") {
      await Project.remove({ user: req.userId });
      return res.send({ message: "Projects deleted" });
    }
    await Project.findByIdAndDelete(req.params.id);
    res.send({ message: "Project deleted" });
  } catch (err) {
    return res.status(400).send({ error: "Error deletting project" });
  }
});

module.exports = (app) => app.use("/projects", router);
