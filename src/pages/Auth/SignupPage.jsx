import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import BrandLogo from "../../components/BrandLogo";
import "./Auth.scss";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError("");
    setLoading(true);
    const res = await signup({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res.success) navigate("/dashboard");
    else setServerError(res.error.message);
  };

  return (
    <Box className="auth-page">
      <Box className="auth-page__panel">
        <Typography className="page-eyebrow">Build your rotation</Typography>
        <Typography variant="h2" className="auth-page__title">
          Turn your wardrobe into a living style system.
        </Typography>
        <Typography className="auth-page__copy">
          Create your account to unlock recommendations, favorites, outfit
          exploration, and a cleaner closet workflow from day one.
        </Typography>
        <Box className="auth-page__features">
          <Box className="auth-page__feature">
            <Typography variant="subtitle2">Personalized occasions</Typography>
            <Typography variant="body2" color="text.secondary">
              Save your default vibe and let the app tune around it.
            </Typography>
          </Box>
          <Box className="auth-page__feature">
            <Typography variant="subtitle2">Smarter closet memory</Typography>
            <Typography variant="body2" color="text.secondary">
              Keep track of wear history, favorites, and what is in laundry.
            </Typography>
          </Box>
          <Box className="auth-page__feature">
            <Typography variant="subtitle2">
              Exploration without clutter
            </Typography>
            <Typography variant="body2" color="text.secondary">
              See outfit directions for work, casual, dates, and more.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card
        className="auth-card surface-panel surface-panel--strong"
        elevation={0}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography className="page-eyebrow" mb={1}>
              New Here
            </Typography>
            <BrandLogo centered showSubtitle={false} titleVariant="h4" />
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Create your account
            </Typography>
          </Box>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Full Name"
              value={form.name}
              margin="normal"
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              margin="normal"
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              margin="normal"
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={form.confirm}
              margin="normal"
              onChange={(e) =>
                setForm((p) => ({ ...p, confirm: e.target.value }))
              }
              error={!!errors.confirm}
              helperText={errors.confirm}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, py: 1.5 }}
              startIcon={
                loading ? <CircularProgress size={18} color="inherit" /> : null
              }
            >
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "inherit",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
