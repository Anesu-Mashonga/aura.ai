import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { TryOutlined } from "@mui/icons-material";
import { LOCAL_AVATARS } from "../../data/localImages";
import "./Dashboard.scss";

const AVATAR_IMGS = LOCAL_AVATARS.virtualTryOn;

export default function VirtualTryOnCard({ outfit }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="surface-panel dashboard__tryon-card"
        sx={{ height: "100%" }}
      >
        <CardContent
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Typography variant="h6" fontWeight={600} mb={1}>
            Virtual Try-On
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Preview how today's edit could sit on different silhouettes.
          </Typography>
          <Box
            component="img"
            src={AVATAR_IMGS[imgIdx]}
            alt="Virtual model"
            className="dashboard__tryon-avatar"
            onClick={() => setImgIdx((i) => (i + 1) % AVATAR_IMGS.length)}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            mb={2}
          >
            Tap the avatar to cycle through model moods
          </Typography>
          <Button
            variant="outlined"
            startIcon={<TryOutlined />}
            onClick={() => setOpen(true)}
            fullWidth
          >
            Try Outfit
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Virtual Try-On</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Virtual try-on uses AI to overlay your selected outfit onto a
            virtual model. This feature will be powered by a real-time 3D
            rendering engine in the full version.
            {outfit?.items?.length > 0 && (
              <Box mt={2}>
                <strong>Current outfit:</strong>{" "}
                {outfit.items.map((i) => i.name).join(", ")}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
