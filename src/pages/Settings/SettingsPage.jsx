import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  TextField,
  Checkbox,
  FormControlLabel as CheckboxLabel,
  CardActions,
  Link,
} from "@mui/material";
import { Logout, RestartAlt } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import { wardrobeService } from "../../services/wardrobeService";
import { INITIAL_WARDROBE } from "../../data/seedData";
import { safeSet } from "../../services/utils";
import {
  BODY_SHAPES,
  FIT_PREFERENCES,
  MOBILITY_PREFERENCES,
  STYLE_TRENDS,
  getDefaultPhysicalProfile,
} from "../../data/styleProfileData";
import "./Settings.scss";

const OCCASIONS = ["Casual", "Work", "Party", "Date", "Sport"];

export default function SettingsPage() {
  const {
    user,
    logout,
    updatePreferences,
    updatePhysicalProfile,
    updateStyleTaste,
  } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();
  const [confirmReset, setConfirmReset] = useState(false);
  const [profileForm, setProfileForm] = useState(getDefaultPhysicalProfile());
  const [selectedTrendIds, setSelectedTrendIds] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const toast = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const handleOccasionChange = async (e) => {
    const res = await updatePreferences({ defaultOccasion: e.target.value });
    if (res.success) toast("Default occasion updated.");
    else toast(res.error.message, "error");
  };

  const handleResetData = () => {
    safeSet("alclo_wardrobe", INITIAL_WARDROBE);
    safeSet("alclo_outfit_history", []);
    safeSet("alclo_favorite_styles", []);
    setConfirmReset(false);
    toast("App data reset to defaults.");
  };

  useEffect(() => {
    setProfileForm({
      ...getDefaultPhysicalProfile(),
      ...(user?.physicalProfile || {}),
    });
    setSelectedTrendIds(user?.styleTaste?.likedTrendIds || []);
  }, [user]);

  const handleProfileInput = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleSaveProfile = async () => {
    const payload = {
      ...profileForm,
      heightCm: toNumberOrNull(profileForm.heightCm),
      weightKg: toNumberOrNull(profileForm.weightKg),
    };
    const res = await updatePhysicalProfile(payload);
    if (res.success) toast("Physical profile updated.");
    else toast(res.error.message, "error");
  };

  const toggleTrendSelection = (trendId) => {
    setSelectedTrendIds((current) =>
      current.includes(trendId)
        ? current.filter((id) => id !== trendId)
        : [...current, trendId],
    );
  };

  const handleSaveStyleTaste = async () => {
    const res = await updateStyleTaste({ likedTrendIds: selectedTrendIds });
    if (res.success) toast("Style taste updated.");
    else toast(res.error.message, "error");
  };

  return (
    <Box className="settings page-container page-shell">
      <Box className="page-hero settings__hero">
        <Box className="page-hero__copy">
          <Typography className="page-eyebrow">Preferences</Typography>
          <Typography variant="h1" className="page-title">
            Your style operating system.
          </Typography>
          <Typography className="page-subtitle">
            Tune your identity, default occasion, and visual environment so the
            product feels tailored before it even makes a suggestion.
          </Typography>
        </Box>
        <Box className="page-actions settings__hero-actions">
          <Box className="page-stat">
            <Typography className="page-stat__label">Member</Typography>
            <Typography className="page-stat__value">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })
                : "Today"}
            </Typography>
          </Box>
          <Box className="page-stat">
            <Typography className="page-stat__label">Mode</Typography>
            <Typography className="page-stat__value">
              {isDark ? "Dark" : "Light"}
            </Typography>
          </Box>
          <Box className="page-stat">
            <Typography className="page-stat__label">
              Default Occasion
            </Typography>
            <Typography className="page-stat__value">
              {user?.preferences?.defaultOccasion || "Casual"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile */}
        <Grid item xs={12} md={6}>
          <Card className="surface-panel surface-panel--strong">
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Profile
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "primary.main",
                    fontSize: 22,
                    "& img": {
                      objectFit: "contain",
                      objectPosition: "center",
                      backgroundColor: "rgba(255,255,255,0.75)",
                      padding: "2px",
                    },
                  }}
                >
                  {user?.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <Card className="surface-panel">
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Appearance
              </Typography>
              <FormControlLabel
                control={<Switch checked={isDark} onChange={toggleTheme} />}
                label="Dark Mode"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={6}>
          <Card className="surface-panel">
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Preferences
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Default Occasion</InputLabel>
                <Select
                  value={user?.preferences?.defaultOccasion || "Casual"}
                  label="Default Occasion"
                  onChange={handleOccasionChange}
                >
                  {OCCASIONS.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="surface-panel surface-panel--strong">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Physical Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Height, body details, and adaptive preferences help the
                    outfit engine avoid awkward fits and prioritize comfort.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSaveProfile}
                >
                  Save Profile
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Height (cm)"
                    value={profileForm.heightCm ?? ""}
                    onChange={(e) =>
                      handleProfileInput("heightCm", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Weight (kg)"
                    value={profileForm.weightKg ?? ""}
                    onChange={(e) =>
                      handleProfileInput("weightKg", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Body Shape</InputLabel>
                    <Select
                      value={profileForm.bodyShape}
                      label="Body Shape"
                      onChange={(e) =>
                        handleProfileInput("bodyShape", e.target.value)
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
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Preferred Fit</InputLabel>
                    <Select
                      value={profileForm.fitPreference}
                      label="Preferred Fit"
                      onChange={(e) =>
                        handleProfileInput("fitPreference", e.target.value)
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

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Adaptive Preference</InputLabel>
                    <Select
                      value={profileForm.mobilityPreference}
                      label="Adaptive Preference"
                      onChange={(e) =>
                        handleProfileInput("mobilityPreference", e.target.value)
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

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Disability Notes (optional)"
                    value={profileForm.disabilityNotes}
                    onChange={(e) =>
                      handleProfileInput("disabilityNotes", e.target.value)
                    }
                    placeholder="Any specific comfort or accessibility needs"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <CheckboxLabel
                      control={
                        <Checkbox
                          checked={Boolean(profileForm.hasPotbelly)}
                          onChange={(e) =>
                            handleProfileInput("hasPotbelly", e.target.checked)
                          }
                        />
                      }
                      label="Potbelly"
                    />
                    <CheckboxLabel
                      control={
                        <Checkbox
                          checked={Boolean(profileForm.pregnant)}
                          onChange={(e) =>
                            handleProfileInput("pregnant", e.target.checked)
                          }
                        />
                      }
                      label="Pregnancy"
                    />
                    <CheckboxLabel
                      control={
                        <Checkbox
                          checked={Boolean(profileForm.hasDisability)}
                          onChange={(e) =>
                            handleProfileInput(
                              "hasDisability",
                              e.target.checked,
                            )
                          }
                        />
                      }
                      label="Disability"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="surface-panel">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Style Taste: Select Looks You'd Wear
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pick trends you like. Recommendations are weighted toward
                    these aesthetics. Inspiration links open Pinterest searches.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSaveStyleTaste}
                >
                  Save Style Taste
                </Button>
              </Box>

              <Grid container spacing={2}>
                {STYLE_TRENDS.map((trend) => {
                  const selected = selectedTrendIds.includes(trend.id);
                  return (
                    <Grid item xs={12} md={6} lg={4} key={trend.id}>
                      <Card
                        variant={selected ? "elevation" : "outlined"}
                        sx={{
                          height: "100%",
                          borderColor: selected ? "primary.main" : "divider",
                          borderWidth: selected ? 2 : 1,
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={700}>
                              {trend.title}
                            </Typography>
                            <Chip
                              size="small"
                              color={selected ? "primary" : "default"}
                              label={selected ? "Selected" : "Not selected"}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {trend.summary}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.75,
                              flexWrap: "wrap",
                              mt: 1.5,
                            }}
                          >
                            {trend.occasions.map((occasion) => (
                              <Chip
                                key={`${trend.id}-${occasion}`}
                                label={occasion}
                                size="small"
                                variant="outlined"
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
                            onClick={() => toggleTrendSelection(trend.id)}
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
                            Pinterest inspiration
                          </Link>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Danger zone */}
        <Grid item xs={12} md={6}>
          <Card className="surface-panel">
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Data & Account
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<RestartAlt />}
                  onClick={() => setConfirmReset(true)}
                >
                  Reset Wardrobe to Defaults
                </Button>
                <Divider />
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Logout />}
                  onClick={logout}
                >
                  Logout
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)}>
        <DialogTitle>Reset App Data</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will reset your wardrobe to the default seed data and clear
            outfit history. Your account will not be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
          <Button onClick={handleResetData} color="warning" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
