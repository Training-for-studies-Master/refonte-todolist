import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import type { Task } from "../../types/task";
import { closeTask, reopenTask, deleteTask } from "../../api/tasksApi";

type Props = {
  task: Task;
  projectClosed: boolean;
  onChanged: () => void;
};

export function TaskItem({ task, projectClosed, onChanged }: Props) {
  const toggleStatus = async () => {
    try {
      if (task.status === "OPEN") {
        await closeTask(task.id);
      } else {
        await reopenTask(task.id);
      }
      onChanged();
    } catch (e) {
      console.error(e);
      alert("Failed to change task status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      onChanged();
    } catch (e) {
      console.error(e);
      alert("Failed to delete task");
    }
  };

  const isClosed = task.status === "CLOSED";

  return (
    <Container fluid className={`item ${isClosed ? "completed" : ""}`}>
      <Row>
        <Col xs={1} className="text-center">
          <Button
            size="sm"
            variant="link"
            onClick={toggleStatus}
            disabled={isClosed && projectClosed}
            aria-label={isClosed ? "Reopen task" : "Close task"}
          >
            <i className={`far ${isClosed ? "fa-check-square" : "fa-square"}`} />
          </Button>
        </Col>

        <Col xs={9} className="name task-name">
          {task.name} ({task.status})
        </Col>

        <Col xs={2} className="text-center remove">
          <Button size="sm" variant="link" onClick={handleDelete} aria-label="Remove task">
            <i className="fa fa-trash text-danger" />
          </Button>
        </Col>
      </Row>
    </Container>
  );
}