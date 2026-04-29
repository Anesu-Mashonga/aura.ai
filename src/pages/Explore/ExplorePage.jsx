import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { CheckroomOutlined } from "@mui/icons-material";
import { useWardrobe } from "../../hooks/useWardrobe";
import { useWeather } from "../../hooks/useWeather";
import { outfitService } from "../../services/outfitService";
import "./Explore.scss";

const OCCASIONS = ["Work", "Casual", "Party", "Date", "Sport"];

const TYPE_ICON = {
  top: "👕",
  bottom: "👖",
  outer: "🧥",
  shoes: "👟",
  accessories: "⌚",
};

export default function ExplorePage() {
  const { items } = useWardrobe();
  const { weather } = useWeather();
  const [selected, setSelected] = useState("Casual");
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    const fetchAll = async () => {
      setLoading(true);
      const results = {};
      await Promise.all(
        OCCASIONS.map(async (occ) => {
          const res = await outfitService.generateOutfit({
            weather,
            occasion: occ,
            wardrobe: items,
          });
          if (res.success) results[occ] = res.data;
        }),
      );
      setSuggestions(results);
      setLoading(false);
    };
    fetchAll();
  }, [items, weather]);

  const current = suggestions[selected];

  return (
    <Box className="explore page-container page-shell">
      <Box className="page-hero explore__hero">
        <Box className="page-hero__copy">
          <Typography className="page-eyebrow">Outfit exploration</Typography>
          <Typography variant="h1" className="page-title">
            Browse the moodboard.
          </Typography>
          <Typography className="page-subtitle">
            Compare occasion-led outfit directions side by side and move from
            casual to statement looks without leaving your closet.
          </Typography>
        </Box>
        <Box className="page-actions explore__chips">
          {OCCASIONS.map((occ) => (
            <Chip
              key={occ}
              label={occ}
              clickable
              color={selected === occ ? "primary" : "default"}
              variant={selected === occ ? "filled" : "outlined"}
              onClick={() => setSelected(occ)}
            />
          ))}
        </Box>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((k) => (
            <Grid item xs={12} sm={6} md={4} key={k}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : !current || current.items.length === 0 ? (
        <Alert severity="info">
          No outfit could be generated for <strong>{selected}</strong>. Try
          adding more items to your wardrobe.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className="surface-panel explore__suggestion-card">
              <CardContent>
                <Chip label={selected} color="primary" sx={{ mb: 2 }} />
                <List dense>
                  {current.items.map((item) => (
                    <Box key={item.id}>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <span style={{ fontSize: 20 }}>
                            {TYPE_ICON[item.type] || "👔"}
                          </span>
                        </ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          secondary={item.categoryLabel || item.type}
                        />
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            bgcolor: item.color,
                            border: "1px solid rgba(0,0,0,0.15)",
                            ml: 1,
                          }}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </Box>
                  ))}
                </List>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={2}
                  sx={{ fontStyle: "italic" }}
                >
                  {current.reason}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              All Occasions
            </Typography>
            <Grid container spacing={1.5}>
              {OCCASIONS.map((occ) => {
                const s = suggestions[occ];
                return (
                  <Grid item xs={12} key={occ}>
                    <Card
                      variant="outlined"
                      className={`surface-panel explore__mini-card ${selected === occ ? "explore__mini-card--active" : ""}`}
                      onClick={() => setSelected(occ)}
                      sx={{ cursor: "pointer" }}
                    >
                      <CardContent sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {occ}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s?.items?.length || 0} items
                          </Typography>
                        </Box>
                        {s?.items?.length > 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {s.items
                              .slice(0, 3)
                              .map((i) => i.name)
                              .join(" · ")}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
