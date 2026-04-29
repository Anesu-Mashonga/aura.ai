import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { QUICK_ADD_PRESET_IMAGES } from "../../data/localImages";

const TYPES = ["top", "bottom", "outer", "shoes", "accessories"];

const PRESETS = [
  {
    name: "T-Shirt",
    type: "top",
    color: "#FFFFFF",
    imageUrl: QUICK_ADD_PRESET_IMAGES.tee,
    tags: ["casual"],
  },
  {
    name: "Jeans",
    type: "bottom",
    color: "#1565C0",
    imageUrl: QUICK_ADD_PRESET_IMAGES.jeans,
    tags: ["casual"],
  },
  {
    name: "Sneakers",
    type: "shoes",
    color: "#FAFAFA",
    imageUrl: QUICK_ADD_PRESET_IMAGES.sneakers,
    tags: ["casual"],
  },
  {
    name: "Jacket",
    type: "outer",
    color: "#37474F",
    imageUrl: QUICK_ADD_PRESET_IMAGES.jacket,
    tags: ["casual"],
  },
];

const EMPTY = {
  name: "",
  type: "top",
  color: "#7c3aed",
  imageUrl: "",
  lastWorn: "",
  favorite: false,
  tags: [],
};

export default function ItemFormDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || "",
              type: initial.type || "top",
              color: initial.color || "#7c3aed",
              imageUrl: initial.imageUrl || "",
              lastWorn: initial.lastWorn ? initial.lastWorn.slice(0, 10) : "",
              favorite: initial.favorite || false,
              tags: initial.tags || [],
            }
          : EMPTY,
      );
      setErrors({});
      setTagInput("");
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.type) e.type = "Type is required.";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    await onSave({
      ...form,
      lastWorn: form.lastWorn ? new Date(form.lastWorn).toISOString() : null,
    });
    setSaving(false);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t))
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };

  const applyPreset = (p) => setForm((f) => ({ ...f, ...p }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? "Edit Item" : "Add New Item"}</DialogTitle>
      <DialogContent>
        {!initial && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2, mt: 1 }}>
            {PRESETS.map((p) => (
              <Chip
                key={p.name}
                label={`+ ${p.name}`}
                clickable
                onClick={() => applyPreset(p)}
                icon={<AddIcon />}
              />
            ))}
          </Box>
        )}
        <Grid container spacing={2} mt={0}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                label="Type"
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {TYPES.map((t) => (
                  <MenuItem
                    key={t}
                    value={t}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                height: "100%",
              }}
            >
              <Box
                component="input"
                type="color"
                value={form.color}
                onChange={(e) =>
                  setForm((f) => ({ ...f, color: e.target.value }))
                }
                style={{
                  width: 40,
                  height: 40,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  padding: 0,
                }}
              />
              <TextField
                fullWidth
                label="Color (hex)"
                value={form.color}
                size="small"
                onChange={(e) =>
                  setForm((f) => ({ ...f, color: e.target.value }))
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Image URL"
              value={form.imageUrl}
              placeholder="https://..."
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Worn"
              type="date"
              value={form.lastWorn}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastWorn: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.favorite}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, favorite: e.target.checked }))
                  }
                />
              }
              label="Mark as Favorite"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                label="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" onClick={addTag}>
                Add
              </Button>
            </Box>
            {form.tags.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                {form.tags.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    size="small"
                    onDelete={() =>
                      setForm((f) => ({
                        ...f,
                        tags: f.tags.filter((x) => x !== t),
                      }))
                    }
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save Changes" : "Add Item"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
