import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import BrandLogo from "../../components/BrandLogo";
import { useAuth } from "../../contexts/AuthContext";
import {
  BODY_SHAPES,
  FIT_PREFERENCES,
  MOBILITY_PREFERENCES,
  STYLE_TRENDS,
  getDefaultPhysicalProfile,
} from "../../data/styleProfileData";
import "./Onboarding.scss";

const STEPS = ["Physical profile", "Style taste"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, logout, updatePhysicalProfile, updateStyleTaste } = useAuth();

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState(getDefaultPhysicalProfile());
  const [selectedTrendIds, setSelectedTrendIds] = useState([]);

  useEffect(() => {
    setProfileForm({
      ...getDefaultPhysicalProfile(),
      ...(user?.physicalProfile || {}),
    });
    setSelectedTrendIds(user?.styleTaste?.likedTrendIds || []);
  }, [user]);

  const profileValid = useMemo(() => {
    const height = Number(profileForm.heightCm);
    const weight = Number(profileForm.weightKg);
    return (
      Number.isFinite(height) &&
      height > 0 &&
      Number.isFinite(weight) &&
      weight > 0
    );
  }, [profileForm.heightCm, profileForm.weightKg]);

  const parseNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const toggleTrend = (trendId) => {
    setSelectedTrendIds((current) =>
      current.includes(trendId)
        ? current.filter((id) => id !== trendId)
        : [...current, trendId],
    );
  };

  const handleNext = async () => {
    setError("");

    if (step === 0) {
      if (!profileValid) {
        setError("Please enter valid height and weight to continue.");
        return;
      }

      setSaving(true);
      const res = await updatePhysicalProfile({
        ...profileForm,
        heightCm: parseNumberOrNull(profileForm.heightCm),
        weightKg: parseNumberOrNull(profileForm.weightKg),
      });
      setSaving(false);

      if (!res.success) {
        setError(res.error.message || "Unable to save profile.");
        return;
      }

      setStep(1);
      return;
    }

    if (selectedTrendIds.length === 0) {
      setError("Select at least one trend so we can personalize suggestions.");
      return;
    }

    setSaving(true);
    const res = await updateStyleTaste({ likedTrendIds: selectedTrendIds });
    setSaving(false);

    if (!res.success) {
      setError(res.error.message || "Unable to save style taste.");
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  const handleBack = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  return (
    <Box className="onboarding page-container page-shell">
      <Card className="surface-panel surface-panel--strong onboarding__frame">
        <CardContent>
          <Box className="onboarding__header">
            <BrandLogo subtitle="first-time setup" />
            <Typography className="page-eyebrow">Welcome to Aura</Typography>
            <Typography variant="h2" className="onboarding__title">
              Let us set your fit and style direction.
            </Typography>
            <Typography className="page-subtitle">
              Complete two quick steps so recommendations are relevant before
              you reach your dashboard.
            </Typography>
          </Box>

          <Stepper activeStep={step} sx={{ mt: 3, mb: 3 }} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {step === 0 ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  size="small"
                  type="number"
                  value={profileForm.heightCm ?? ""}
                  onChange={(event) =>
                    updateProfileField("heightCm", event.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  size="small"
                  type="number"
                  value={profileForm.weightKg ?? ""}
                  onChange={(event) =>
                    updateProfileField("weightKg", event.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Body Shape</InputLabel>
                  <Select
                    value={profileForm.bodyShape}
                    label="Body Shape"
                    onChange={(event) =>
                      updateProfileField("bodyShape", event.target.value)
                    }
                  >
                    {BODY_SHAPES.map((shape) => (
                      <MenuItem key={shape.value} value={shape.value}>
                        {shape.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Preferred Fit</InputLabel>
                  <Select
                    value={profileForm.fitPreference}
                    label="Preferred Fit"
                    onChange={(event) =>
                      updateProfileField("fitPreference", event.target.value)
                    }
                  >
                    {FIT_PREFERENCES.map((fit) => (
                      <MenuItem key={fit.value} value={fit.value}>
                        {fit.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Adaptive Preference</InputLabel>
                  <Select
                    value={profileForm.mobilityPreference}
                    label="Adaptive Preference"
                    onChange={(event) =>
                      updateProfileField(
                        "mobilityPreference",
                        event.target.value,
                      )
                    }
                  >
                    {MOBILITY_PREFERENCES.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Disability or comfort notes (optional)"
                  value={profileForm.disabilityNotes}
                  onChange={(event) =>
                    updateProfileField("disabilityNotes", event.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Box className="onboarding__checks">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(profileForm.hasPotbelly)}
                        onChange={(event) =>
                          updateProfileField(
                            "hasPotbelly",
                            event.target.checked,
                          )
                        }
                      />
                    }
                    label="Potbelly"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(profileForm.pregnant)}
                        onChange={(event) =>
                          updateProfileField("pregnant", event.target.checked)
                        }
                      />
                    }
                    label="Pregnancy"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(profileForm.hasDisability)}
                        onChange={(event) =>
                          updateProfileField(
                            "hasDisability",
                            event.target.checked,
                          )
                        }
                      />
                    }
                    label="Disability"
                  />
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {STYLE_TRENDS.map((trend) => {
                const selected = selectedTrendIds.includes(trend.id);
                return (
                  <Grid item xs={12} md={6} lg={4} key={trend.id}>
                    <Card
                      variant="outlined"
                      className="onboarding__trend-card"
                      sx={{
                        borderColor: selected ? "primary.main" : "divider",
                        borderWidth: selected ? 2 : 1,
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {trend.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={0.5}
                        >
                          {trend.summary}
                        </Typography>
                        <Box
                          mt={1.5}
                          sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}
                        >
                          {trend.occasions.map((occasion) => (
                            <Chip
                              key={`${trend.id}-${occasion}`}
                              size="small"
                              variant="outlined"
                              label={occasion}
                            />
                          ))}
                        </Box>
                      </CardContent>
                      <CardActions
                        sx={{
                          px: 2,
                          pb: 2,
                          pt: 0,
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          size="small"
                          variant={selected ? "contained" : "outlined"}
                          onClick={() => toggleTrend(trend.id)}
                        >
                          {selected ? "Selected" : "Select"}
                        </Button>
                        <Link
                          href={trend.pinterestUrl}
                          target="_blank"
                          rel="noreferrer"
                          underline="hover"
                          variant="body2"
                        >
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            Inspiration <OpenInNew fontSize="inherit" />
                          </Box>
                        </Link>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>

        <CardActions className="onboarding__actions">
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={handleBack} disabled={step === 0 || saving}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={saving}
              startIcon={
                saving ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              {step === STEPS.length - 1 ? "Finish" : "Continue"}
            </Button>
          </Box>
        </CardActions>
      </Card>
    </Box>
  );
}
