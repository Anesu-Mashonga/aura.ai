import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useOutfit } from "../../hooks/useOutfit";
import "./FavoriteStyles.scss";

const OCCASIONS = ["All", "Casual", "Work", "Party", "Date", "Sport"];

function formatOutfitDate(look) {
  return dayjs(look.acceptedAt || look.wornAt || look.date).format(
    "MMM D, YYYY",
  );
}

export default function FavoriteStylesPage() {
  const { favoriteStyles, favoriteLoading } = useOutfit();
  const [occasion, setOccasion] = useState("All");
  const [focus, setFocus] = useState(null);

  const filtered = useMemo(
    () =>
      favoriteStyles.filter(
        (look) => occasion === "All" || look.occasion === occasion,
      ),
    [favoriteStyles, occasion],
  );

  const occasionCount = useMemo(() => {
    const counts = favoriteStyles.reduce((acc, look) => {
      acc[look.occasion] = (acc[look.occasion] || 0) + 1;
      return acc;
    }, {});
    return counts;
  }, [favoriteStyles]);

  return (
    <Box className="favorites page-container page-shell">
      <Box className="page-hero favorites__hero">
        <Box className="page-hero__copy">
          <Typography className="page-eyebrow">Saved combinations</Typography>
          <Typography variant="h1" className="page-title">
            Favorite styles.
          </Typography>
          <Typography className="page-subtitle">
            Review accepted outfits by occasion and reopen any look with full
            item detail.
          </Typography>
        </Box>
        <Box className="page-actions favorites__hero-stats">
          <Box className="page-stat">
            <Typography className="page-stat__label">Total Saved</Typography>
            <Typography className="page-stat__value">
              {favoriteStyles.length}
            </Typography>
          </Box>
          <Box className="page-stat">
            <Typography className="page-stat__label">Occasions</Typography>
            <Typography className="page-stat__value">
              {Object.keys(occasionCount).length}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card className="surface-panel favorites__filters-panel">
        <CardContent>
          <Box className="favorites__filters">
            {OCCASIONS.map((label) => (
              <Chip
                key={label}
                label={label}
                clickable
                onClick={() => setOccasion(label)}
                color={occasion === label ? "primary" : "default"}
                variant={occasion === label ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {favoriteLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((key) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Card className="surface-panel favorites__card-skeleton" />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length ? (
        <Grid container spacing={2}>
          {filtered.map((look) => (
            <Grid item xs={12} sm={6} md={4} key={look.id}>
              <Card className="surface-panel favorites__card">
                <CardContent>
                  <Box className="favorites__meta-row">
                    <Chip
                      size="small"
                      label={look.occasion}
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatOutfitDate(look)}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {look.weather?.tempC ?? "--"}°C
                    {look.weather?.condition
                      ? ` · ${look.weather.condition}`
                      : ""}
                  </Typography>
                  <Box className="favorites__preview-list">
                    {look.items.slice(0, 4).map((item) => (
                      <Chip
                        key={`${look.id}-${item.id}`}
                        size="small"
                        label={item.name}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Button size="small" onClick={() => setFocus(look)}>
                    Open style
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          No favorite styles available for <strong>{occasion}</strong> yet.
        </Alert>
      )}

      <Dialog
        open={Boolean(focus)}
        onClose={() => setFocus(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {focus ? `${focus.occasion} favorite` : "Favorite style"}
        </DialogTitle>
        <DialogContent dividers>
          {focus && (
            <Box className="favorites__detail-grid">
              {focus.items.map((item) => (
                <Box
                  key={`${focus.id}-${item.id}`}
                  className="favorites__detail-item"
                >
                  <Box
                    component="img"
                    src={item.imageUrl}
                    alt={item.name}
                    className="favorites__detail-image"
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {item.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {item.type}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFocus(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
