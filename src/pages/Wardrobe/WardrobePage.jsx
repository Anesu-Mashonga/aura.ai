import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Button,
  IconButton,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add,
  Favorite,
  FavoriteBorder,
  Edit,
  Delete,
  Search,
} from "@mui/icons-material";
import { useWardrobe } from "../../hooks/useWardrobe";
import ItemFormDialog from "./ItemFormDialog";
import "./Wardrobe.scss";

const TYPE_FILTERS = ["all", "top", "bottom", "outer", "shoes", "accessories"];

export default function WardrobePage() {
  const { items, loading, addItem, editItem, removeItem, toggleFav } =
    useWardrobe();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const toast = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const favoriteCount = items.filter((item) => item.favorite).length;
  const laundryCount = items.filter((item) => item.inLaundry).length;

  const filtered = items
    .filter((i) => filter === "all" || i.type === filter)
    .filter(
      (i) =>
        !search ||
        [i.name, i.type, i.color, ...(i.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    );

  const handleSave = async (payload) => {
    if (editTarget) {
      const res = await editItem(editTarget.id, payload);
      if (res.success) toast("Item updated!");
      else toast(res.error.message, "error");
    } else {
      const res = await addItem(payload);
      if (res.success) toast("Item added!");
      else toast(res.error.message, "error");
    }
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await removeItem(deleteTarget.id);
    if (res.success) toast("Item deleted.");
    else toast(res.error.message, "error");
    setDeleteTarget(null);
  };

  const handleToggleFav = async (id) => {
    await toggleFav(id);
  };

  return (
    <Box className="wardrobe page-container page-shell">
      <Box className="page-hero wardrobe__hero">
        <Box className="page-hero__copy">
          <Typography className="page-eyebrow">Closet control</Typography>
          <Typography variant="h1" className="page-title">
            Wardrobe, tuned.
          </Typography>
          <Typography className="page-subtitle">
            Keep your collection visually organized, searchable, and ready for
            recommendations without the clutter.
          </Typography>
        </Box>
        <Box className="page-actions wardrobe__hero-actions">
          <Box className="page-stat">
            <Typography className="page-stat__label">All Pieces</Typography>
            <Typography className="page-stat__value">{items.length}</Typography>
          </Box>
          <Box className="page-stat">
            <Typography className="page-stat__label">Favorites</Typography>
            <Typography className="page-stat__value">
              {favoriteCount}
            </Typography>
          </Box>
          <Box className="page-stat">
            <Typography className="page-stat__label">In Laundry</Typography>
            <Typography className="page-stat__value">{laundryCount}</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      <Card className="surface-panel wardrobe__controls-panel">
        <CardContent>
          <Box className="wardrobe__controls">
            <TextField
              size="small"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search
                    sx={{ mr: 1, color: "text.secondary", fontSize: 20 }}
                  />
                ),
              }}
              sx={{ minWidth: 220 }}
            />
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, v) => v && setFilter(v)}
              size="small"
              className="wardrobe__filters"
            >
              {TYPE_FILTERS.map((t) => (
                <ToggleButton key={t} value={t}>
                  {t}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Typography variant="body2" color="text.secondary">
              {filtered.length} visible
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <Grid item xs={6} sm={4} md={3} key={k}>
              <Skeleton variant="rounded" height={260} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box className="wardrobe__empty surface-panel">
          <Typography variant="h6" color="text.secondary">
            {items.length === 0
              ? "Your wardrobe is empty. Add your first item!"
              : "No items match your filter."}
          </Typography>
          {items.length === 0 && (
            <Button
              variant="outlined"
              startIcon={<Add />}
              sx={{ mt: 2 }}
              onClick={() => setFormOpen(true)}
            >
              Add First Item
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2} mt={0}>
          {filtered.map((item) => (
            <Grid item xs={6} sm={4} md={3} key={item.id}>
              <Card className="surface-panel wardrobe__item-card">
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    image={item.imageUrl}
                    alt={item.name}
                    sx={{
                      height: 160,
                      objectFit: "contain",
                      bgcolor: "rgba(255,255,255,0.74)",
                      p: 0.75,
                    }}
                  />
                  <Chip
                    label={item.type}
                    size="small"
                    className="wardrobe__type-badge"
                    sx={{ position: "absolute", top: 8, left: 8 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleToggleFav(item.id)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(255,255,255,0.8)",
                    }}
                  >
                    {item.favorite ? (
                      <Favorite color="error" fontSize="small" />
                    ) : (
                      <FavoriteBorder fontSize="small" />
                    )}
                  </IconButton>
                </Box>
                <CardContent sx={{ py: 1.5, pb: "8px !important" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: item.color,
                        border: "1px solid rgba(0,0,0,0.15)",
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {item.name}
                    </Typography>
                  </Box>
                  {item.inLaundry && (
                    <Chip
                      label="In Laundry"
                      size="small"
                      color="warning"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </CardContent>
                <CardActions sx={{ pt: 0, justifyContent: "flex-end" }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditTarget(item);
                        setFormOpen(true);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ItemFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
        initial={editTarget}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
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
