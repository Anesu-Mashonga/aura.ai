import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardMedia,
  Button,
  LinearProgress,
  IconButton,
  Snackbar,
  Alert,
  Skeleton,
  Checkbox,
} from "@mui/material";
import {
  Search,
  CleaningServices,
  DoneAll,
  Refresh,
} from "@mui/icons-material";
import { useWardrobe } from "../../hooks/useWardrobe";
import { laundryService } from "../../services/laundryService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./Laundry.scss";

dayjs.extend(relativeTime);

const FILTER_CHIPS = ["all", "urgent", "top", "bottom", "shoes", "accessories"];

export default function LaundryPage() {
  const { items, markClean } = useWardrobe();
  const [laundryItems, setLaundryItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date");
  const [selected, setSelected] = useState([]);
  const [statusVisible, setStatusVisible] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const toast = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  useEffect(() => {
    const fetchData = async () => {
      if (items.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [laundryRes, statsRes] = await Promise.all([
        laundryService.getLaundryItems(items),
        laundryService.getLaundryStats(items),
      ]);
      if (laundryRes.success) setLaundryItems(laundryRes.data);
      if (statsRes.success) setStats(statsRes.data);
      setLoading(false);
    };
    fetchData();
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...laundryItems];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((i) =>
        [i.name, i.type, i.color, ...(i.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(s),
      );
    }
    if (filter === "urgent") list = list.filter((i) => i.urgency === "urgent");
    else if (filter !== "all") list = list.filter((i) => i.type === filter);
    if (sort === "date")
      list.sort((a, b) => new Date(b.lastWorn) - new Date(a.lastWorn));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "type") list.sort((a, b) => a.type.localeCompare(b.type));
    return list;
  }, [laundryItems, search, filter, sort]);

  const toggleSelect = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const handleMarkClean = async (ids) => {
    if (!ids.length) {
      toast("No items selected.", "warning");
      return;
    }
    const res = await markClean(ids);
    if (res.success) {
      toast(`${ids.length} item(s) marked clean.`);
      setSelected([]);
    } else toast(res.error.message, "error");
  };

  const handleBulkClean = () => {
    const ids = selected.length > 0 ? selected : filtered.map((i) => i.id);
    handleMarkClean(ids);
  };

  const statusMsg = !stats
    ? ""
    : stats.dirtyPercentage >= 60
      ? "🚨 High laundry load — time for a wash!"
      : stats.dirtyPercentage >= 30
        ? "⚠️ Your laundry is building up."
        : "✅ Wardrobe in good shape!";

  const heroStats = [
    { label: "Dirty", value: String(stats?.dirtyItems ?? 0) },
    { label: "Urgent", value: String(stats?.urgentItems ?? 0) },
    {
      label: "Clean",
      value: String(
        stats?.cleanItems ?? Math.max(items.length - laundryItems.length, 0),
      ),
    },
  ];

  return (
    <Box className="laundry page-container page-shell">
      <Box className="page-hero laundry__hero">
        <Box className="page-hero__copy">
          <Typography className="page-eyebrow">Rotation health</Typography>
          <Typography variant="h1" className="page-title">
            Keep the flow clean.
          </Typography>
          <Typography className="page-subtitle">
            Track what is out of play, surface urgent pieces fast, and return
            items to your active wardrobe with less friction.
          </Typography>
        </Box>
        <Box className="page-actions laundry__hero-actions">
          {heroStats.map((stat) => (
            <Box key={stat.label} className="page-stat">
              <Typography className="page-stat__label">{stat.label}</Typography>
              <Typography className="page-stat__value">{stat.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Status panel */}
      {statusVisible && stats && (
        <Card className="surface-panel laundry__status-card">
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {statusMsg}
                </Typography>
                <Box sx={{ display: "flex", gap: 3, mt: 1, flexWrap: "wrap" }}>
                  <Typography variant="caption" color="text.secondary">
                    Total: <strong>{stats.totalItems}</strong>
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    Dirty: <strong>{stats.dirtyItems}</strong>
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    Urgent: <strong>{stats.urgentItems}</strong>
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Clean: <strong>{stats.cleanItems}</strong>
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.dirtyPercentage}
                  color={
                    stats.dirtyPercentage >= 60
                      ? "error"
                      : stats.dirtyPercentage >= 30
                        ? "warning"
                        : "success"
                  }
                  sx={{ mt: 1.5, borderRadius: 4, height: 8 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {stats.dirtyPercentage}% needs washing
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setStatusVisible(false)}
                sx={{ ml: 2 }}
              >
                ✕
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}

      {!statusVisible && (
        <Button
          size="small"
          startIcon={<Refresh />}
          onClick={() => setStatusVisible(true)}
        >
          Show Status
        </Button>
      )}

      <Card className="surface-panel laundry__filters-panel">
        <CardContent>
          <Box className="laundry__controls">
            <TextField
              size="small"
              placeholder="Search dirty items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search
                    sx={{ mr: 1, color: "text.secondary", fontSize: 20 }}
                  />
                ),
              }}
              sx={{ flex: 1, minWidth: 180 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sort}
                label="Sort"
                onChange={(e) => setSort(e.target.value)}
              >
                <MenuItem value="date">Latest</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="type">Type</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box className="laundry__chips">
            {FILTER_CHIPS.map((f) => (
              <Chip
                key={f}
                label={f}
                clickable
                size="small"
                color={filter === f ? "primary" : "default"}
                variant={filter === f ? "filled" : "outlined"}
                onClick={() => setFilter(f)}
                sx={{ textTransform: "capitalize" }}
              />
            ))}
          </Box>

          <Box className="laundry__bulk-actions">
            <Button
              variant="outlined"
              size="small"
              startIcon={<DoneAll />}
              onClick={handleBulkClean}
              disabled={filtered.length === 0}
            >
              {selected.length > 0
                ? `Mark ${selected.length} Clean`
                : `Clean All (${filtered.length})`}
            </Button>
            {selected.length > 0 && (
              <Button size="small" onClick={() => setSelected([])}>
                Clear selection
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Item list */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} variant="rounded" height={80} />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <Box className="laundry__empty surface-panel">
          <CleaningServices
            sx={{ fontSize: 48, color: "success.main", mb: 1 }}
          />
          <Typography variant="h6" color="text.secondary">
            {laundryItems.length === 0
              ? "Everything is clean! 🎉"
              : "No items match your filter."}
          </Typography>
        </Box>
      ) : (
        <Box className="laundry__list">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`surface-panel laundry__item ${item.urgency === "urgent" ? "laundry__item--urgent" : ""}`}
            >
              <Box className="laundry__item-inner">
                <Checkbox
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  size="small"
                />
                <CardMedia
                  component="img"
                  image={item.imageUrl}
                  alt={item.name}
                  sx={{
                    width: 64,
                    height: 64,
                    objectFit: "contain",
                    bgcolor: "rgba(255,255,255,0.75)",
                    p: 0.5,
                    borderRadius: 1.5,
                    flexShrink: 0,
                  }}
                />
                <Box className="laundry__item-info">
                  <Typography variant="body2" fontWeight={600}>
                    {item.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {item.type}
                    </Typography>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: item.color,
                        border: "1px solid rgba(0,0,0,0.15)",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Worn{" "}
                      {item.lastWorn
                        ? dayjs(item.lastWorn).fromNow()
                        : "unknown"}
                    </Typography>
                  </Box>
                </Box>
                <Box className="laundry__item-actions">
                  {item.urgency === "urgent" && (
                    <Chip label="Urgent" color="error" size="small" />
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CleaningServices />}
                    onClick={() => handleMarkClean([item.id])}
                  >
                    Clean
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

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
