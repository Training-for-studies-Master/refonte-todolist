import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { register } from "../../api/authApi";

type Props = {
  onRegister: () => void;
};

export function RegisterForm({ onRegister }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState(""); // Nouvel état pour la date
  const [submitting, setSubmitting] = useState(false);

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // On envoie la birthDate à l'API
      await register(username, password, birthDate);
      onRegister();
    } catch (e) {
      console.error(e);
      alert("Inscription échouée");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={submitRegister}>
      <Form.Control
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Nom d'utilisateur"
        disabled={submitting}
        className="mb-2"
      />
      <Form.Control
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        disabled={submitting}
        className="mb-2"
      />
      
      <Form.Group className="mb-2">
        <Form.Label className="text-muted small">Date de naissance (Optionnel)</Form.Label>
        <Form.Control
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          disabled={submitting}
        />
      </Form.Group>

      <Button type="submit" disabled={submitting || !username || !password} className="w-100">
        {submitting ? "En cours d'inscription..." : "S'inscrire"}
      </Button>
    </Form>
  );
}