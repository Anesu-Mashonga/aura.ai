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
} from "@mui/material";
import { Logout, RestartAlt } from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import { wardrobeService } from "../../services/wardrobeService";
import { INITIAL_WARDROBE } from "../../data/seedData";
import { safeSet } from "../../services/utils";
import "./Settings.scss";

const OCCASIONS = ["Casual", "Work", "Party", "Date", "Sport"];

export default function SettingsPage() {
  const { user, logout, updatePreferences } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();
  const [confirmReset, setConfirmReset] = useState(false);
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
