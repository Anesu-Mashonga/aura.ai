import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Divider,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Refresh,
  Check,
  CheckroomOutlined,
  LocalLaundryService,
  Favorite,
  FavoriteBorder,
  WbSunny,
  Store,
  OpenInNew,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import { useWardrobe } from "../../hooks/useWardrobe";
import { useOutfit } from "../../hooks/useOutfit";
import { useWeather } from "../../hooks/useWeather";
import { wardrobeService } from "../../services/wardrobeService";
import { getLaundryStatus } from "../../services/laundryService";
import { PRODUCT_RECOMMENDATIONS } from "../../data/seedData";
import VirtualTryOnCard from "./VirtualTryOnCard";
import "./Dashboard.scss";

const OCCASIONS = ["Casual", "Work", "Party", "Date", "Sport"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading: wardrobeLoading } = useWardrobe();
  const { weather, loading: weatherLoading } = useWeather();
  const {
    outfit,
    loading: outfitLoading,
    generate,
    accept,
    saveFavorite,
    favoriteStyles,
    favoriteLoading,
  } = useOutfit();
  const [occasion, setOccasion] = useState(
    user?.preferences?.defaultOccasion || "Casual",
  );
  const [accepted, setAccepted] = useState(false);
  const [savedFavorite, setSavedFavorite] = useState(false);
  const [variationIndex, setVariationIndex] = useState(0);
  const [historyFocus, setHistoryFocus] = useState(null);

  useEffect(() => {
    wardrobeService.seedInitialDataIfEmpty();
  }, []);

  useEffect(() => {
    if (items.length > 0 && weather) {
      setVariationIndex(0);
      generate({ weather, occasion, wardrobe: items, variationIndex: 0 });
    }
  }, [items, weather, occasion, generate]);

  const handleAccept = async () => {
    const res = await accept();
    if (res?.success) setAccepted(true);
  };

  const today = dayjs();
  const greeting =
    today.hour() < 12
      ? "Good morning"
      : today.hour() < 18
        ? "Good afternoon"
        : "Good evening";

  // Stats
  const weekAgo = Date.now() - 7 * 86400000;
  const wornThisWeek = items.filter(
    (i) => i.lastWorn && new Date(i.lastWorn) > weekAgo,
  ).length;
  const dirtyItems = items.filter(
    (item) => getLaundryStatus(item).isDirty,
  ).length;
  const favoriteItemCount = items.filter((i) => i.favorite).length;

  const stats = [
    { label: "Total Items", value: items.length, icon: <CheckroomOutlined /> },
    { label: "Worn This Week", value: wornThisWeek, icon: <WbSunny /> },
    { label: "Needs Wash", value: dirtyItems, icon: <LocalLaundryService /> },
    { label: "Favorites", value: favoriteItemCount, icon: <Favorite /> },
  ];

  const heroStats = [
    {
      label: "Weather",
      value: weatherLoading ? "Loading…" : `${weather?.tempC ?? "--"}°C`,
    },
    { label: "Occasion", value: occasion },
    {
      label: "Ready Pieces",
      value: String(Math.max(items.length - dirtyItems, 0)),
    },
  ];

  const recentLooks = favoriteStyles.slice(0, 6);

  useEffect(() => {
    if (!outfit?.id) {
      setSavedFavorite(false);
      return;
    }
    setSavedFavorite(
      favoriteStyles.some((look) => look.sourceOutfitId === outfit.id),
    );
  }, [outfit, favoriteStyles]);

  const handleSaveFavorite = async () => {
    const res = await saveFavorite();
    if (res?.success) setSavedFavorite(true);
  };

  const handleRefreshLook = () => {
    const nextVariation = variationIndex + 1;
    setVariationIndex(nextVariation);
    generate({
      weather,
      occasion,
      wardrobe: items,
      variationIndex: nextVariation,
      excludeItemIds: outfit?.items?.map((item) => item.id) || [],
    });
    setAccepted(false);
    setSavedFavorite(false);
  };

  return (
    <Box className="dashboard page-container page-shell">
      <Box className="page-hero dashboard__hero">
        <Box className="page-hero__copy">
          <Typography className="page-eyebrow">
            Daily wardrobe intelligence
          </Typography>
          <Typography variant="h1" className="page-title">
            {greeting}, {user?.name?.split(" ")[0]}.
          </Typography>
          <Typography className="page-subtitle">
            Style the day with better rhythm: weather-aware suggestions,
            rotation health, and elevated essentials in one editorial dashboard.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {today.format("dddd, MMMM D, YYYY")}
          </Typography>
        </Box>
        <Box className="page-actions dashboard__hero-stats">
          {heroStats.map((stat) => (
            <Box key={stat.label} className="page-stat">
              <Typography className="page-stat__label">{stat.label}</Typography>
              <Typography className="page-stat__value">{stat.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Grid container spacing={3} mt={0}>
        {/* Context Card */}
        <Grid item xs={12} md={4}>
          <Card className="surface-panel dashboard__context-card">
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Today's Context
              </Typography>
              <Box className="dashboard__weather" mt={1}>
                {weatherLoading ? (
                  <Skeleton width={120} height={40} />
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h3">
                      {weather?.icon || "🌤️"}
                    </Typography>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {weather?.tempC ?? "--"}°C
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {weather?.condition || "Unknown"}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <FormControl fullWidth size="small">
                <InputLabel>Occasion</InputLabel>
                <Select
                  value={occasion}
                  label="Occasion"
                  onChange={(e) => {
                    setOccasion(e.target.value);
                    setAccepted(false);
                  }}
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

        {/* Outfit of the Day */}
        <Grid item xs={12} md={8}>
          <Card className="surface-panel dashboard__outfit-card">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Outfit of the Day
                  </Typography>
                  <Chip
                    label={occasion}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Tooltip title="Generate another clean look">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleRefreshLook}
                        disabled={outfitLoading}
                        aria-label="Generate another clean look"
                      >
                        <Refresh fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={
                      savedFavorite
                        ? "Already saved to favorites"
                        : "Save to favorites"
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        color={savedFavorite ? "error" : "default"}
                        onClick={handleSaveFavorite}
                        disabled={
                          outfitLoading ||
                          !outfit?.items?.length ||
                          savedFavorite
                        }
                        aria-label="Save style to favorites"
                      >
                        {savedFavorite ? (
                          <Favorite fontSize="small" />
                        ) : (
                          <FavoriteBorder fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Accept outfit">
                    <span>
                      <Button
                        size="small"
                        variant={accepted ? "contained" : "outlined"}
                        color={accepted ? "success" : "primary"}
                        startIcon={<Check />}
                        onClick={handleAccept}
                        disabled={
                          outfitLoading || accepted || !outfit?.items?.length
                        }
                      >
                        {accepted ? "Accepted" : "Accept"}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </Box>

              {outfitLoading || wardrobeLoading ? (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {[1, 2, 3].map((k) => (
                    <Skeleton
                      key={k}
                      variant="rounded"
                      width={90}
                      height={110}
                    />
                  ))}
                </Box>
              ) : outfit?.items?.length ? (
                <>
                  <Box className="dashboard__outfit-grid">
                    {outfit.items.map((item) => (
                      <Tooltip
                        key={item.id}
                        title={`${item.name} · ${item.type}`}
                        arrow
                      >
                        <Box className="dashboard__outfit-item">
                          <CardMedia
                            component="img"
                            image={item.imageUrl}
                            alt={item.name}
                            sx={{
                              width: 90,
                              height: 90,
                              objectFit: "contain",
                              bgcolor: "rgba(255,255,255,0.72)",
                              p: 0.5,
                              borderRadius: 2,
                            }}
                          />
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ maxWidth: 90, textAlign: "center" }}
                          >
                            {item.name}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={2}
                    sx={{ fontStyle: "italic" }}
                  >
                    {outfit.reason}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No outfit could be generated. Try adding more items to your
                  wardrobe.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Virtual Try-On placeholder */}
        <Grid item xs={12} md={4}>
          <VirtualTryOnCard outfit={outfit} />
        </Grid>

        {/* Wardrobe Stats */}
        <Grid item xs={12} md={8}>
          <Card className="surface-panel dashboard__overview-card">
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Wardrobe Overview
              </Typography>
              <Grid container spacing={2}>
                {stats.map((s) => (
                  <Grid item xs={6} sm={3} key={s.label}>
                    <Box className="dashboard__stat">
                      <Box className="dashboard__stat-icon">{s.icon}</Box>
                      <Typography variant="h5" fontWeight={700}>
                        {wardrobeLoading ? <Skeleton width={30} /> : s.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="surface-panel dashboard__history-panel">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Favorite Styles
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accepted looks are saved as favorite styles so your best
                    combinations stay reusable.
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Chip
                    size="small"
                    color="secondary"
                    variant="outlined"
                    label={`${favoriteStyles.length} saved`}
                  />
                  <Button size="small" onClick={() => navigate("/favorites")}>
                    View all
                  </Button>
                </Box>
              </Box>

              {favoriteLoading ? (
                <Box className="dashboard__history-track">
                  {[1, 2, 3].map((key) => (
                    <Skeleton
                      key={key}
                      variant="rounded"
                      height={184}
                      className="dashboard__history-skeleton"
                    />
                  ))}
                </Box>
              ) : recentLooks.length ? (
                <Box className="dashboard__history-track">
                  {recentLooks.map((look) => (
                    <Card
                      key={look.id}
                      variant="outlined"
                      className="surface-panel dashboard__history-look"
                    >
                      <CardContent>
                        <Box className="dashboard__history-meta">
                          <Chip
                            label={look.occasion}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(look.date).format("MMM D")}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {dayjs(look.date).format("dddd")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {look.weather?.tempC ?? "--"}°C
                          {look.weather?.condition
                            ? ` · ${look.weather.condition}`
                            : ""}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={1.25}
                          className="dashboard__history-reason"
                        >
                          {look.reason}
                        </Typography>
                        <Box className="dashboard__history-list">
                          {look.items.slice(0, 4).map((item) => (
                            <Chip
                              key={`${look.id}-${item.id}`}
                              label={item.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                        <Button
                          size="small"
                          onClick={() => setHistoryFocus(look)}
                        >
                          View look
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box className="dashboard__history-empty">
                  <Typography variant="body1" fontWeight={600}>
                    Your archive is empty.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tap the heart beside regenerate to save a style here.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* For You / Shopping */}
        <Grid item xs={12}>
          <Card className="surface-panel dashboard__shopping-card">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  For You
                </Typography>
                <Button size="small" endIcon={<Store />}>
                  Shop All
                </Button>
              </Box>
              <Grid container spacing={2}>
                {PRODUCT_RECOMMENDATIONS.map((p) => (
                  <Grid item xs={6} sm={3} key={p.id}>
                    <Card
                      variant="outlined"
                      className="surface-panel dashboard__product-card"
                    >
                      <CardMedia
                        component="img"
                        image={p.imageUrl}
                        alt={p.name}
                        sx={{
                          height: 140,
                          objectFit: "contain",
                          bgcolor: "rgba(255,255,255,0.78)",
                          p: 0.5,
                        }}
                      />
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.brand}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="primary.main"
                          >
                            {p.price}
                          </Typography>
                          <IconButton size="small">
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={Boolean(historyFocus)}
        onClose={() => setHistoryFocus(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {historyFocus ? `${historyFocus.occasion} look` : "Saved look"}
        </DialogTitle>
        <DialogContent dividers>
          {historyFocus && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Chip
                  label={historyFocus.occasion}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  {dayjs(historyFocus.date).format("MMMM D, YYYY")}
                  {historyFocus.weather?.condition
                    ? ` · ${historyFocus.weather.condition}`
                    : ""}
                  {historyFocus.weather?.tempC !== undefined
                    ? ` · ${historyFocus.weather.tempC}°C`
                    : ""}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={2}>
                {historyFocus.reason}
              </Typography>
              <Box className="dashboard__history-detail-grid">
                {historyFocus.items.map((item) => (
                  <Box
                    key={`${historyFocus.id}-${item.id}`}
                    className="dashboard__history-detail-item"
                  >
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt={item.name}
                      className="dashboard__history-detail-image"
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryFocus(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
