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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
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
    const res = await login(form);
    setLoading(false);
    if (res.success) navigate("/dashboard");
    else setServerError(res.error.message);
  };

  const fillDemo = () =>
    setForm({ email: "demo@aura.ai", password: "demo1234" });

  return (
    <Box className="auth-page">
      <Box className="auth-page__panel">
        <Typography className="page-eyebrow">Wardrobe intelligence</Typography>
        <Typography variant="h2" className="auth-page__title">
          Dress with a sharper point of view every day.
        </Typography>
        <Typography className="auth-page__copy">
          Aura.ai pairs your closet with weather, occasion, and laundry status
          so your next look feels considered instead of random.
        </Typography>
        <Box className="auth-page__features">
          <Box className="auth-page__feature">
            <Typography variant="subtitle2">Curated daily outfits</Typography>
            <Typography variant="body2" color="text.secondary">
              Recommendations adapt to freshness, favorites, and the moment.
            </Typography>
          </Box>
          <Box className="auth-page__feature">
            <Typography variant="subtitle2">Wardrobe-first shopping</Typography>
            <Typography variant="body2" color="text.secondary">
              Discover what complements what you already own before you buy.
            </Typography>
          </Box>
          <Box className="auth-page__feature">
            <Typography variant="subtitle2">Laundry-aware rotation</Typography>
            <Typography variant="body2" color="text.secondary">
              Keep your best pieces in circulation without overwearing them.
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
              Welcome Back
            </Typography>
            <BrandLogo centered showSubtitle={false} titleVariant="h4" />
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Sign in to your wardrobe
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
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>or</Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={fillDemo}
            sx={{ mb: 2 }}
          >
            Use Demo Account
          </Button>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "inherit",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              Sign up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
