import { useState, useCallback } from "react";
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
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { TryOutlined } from "@mui/icons-material";
import { LOCAL_AVATARS } from "../../data/localImages";
import { generateVTOImage } from "../../services/geminiService";
import { useAuth } from "../../contexts/AuthContext";
import "./Dashboard.scss";

const AVATAR_IMG = LOCAL_AVATARS.demo;

export default function VirtualTryOnCard({ outfit }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [vtoImage, setVtoImage] = useState(null);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  const isCachedVTO = Boolean(vtoImage?.fromCache);

  const handleGenerateVTO = useCallback(async () => {
    if (vtoImage) {
      // If VTO already generated, just show dialog
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateVTOImage(
        AVATAR_IMG,
        outfit?.items || [],
        user,
      );

      if (!result.success) {
        setError(result.error?.message || "Failed to generate outfit preview");
        setShowError(true);
        setIsGenerating(false);
        return;
      }

      // For now, we'll store the generation data
      // In a full implementation, this would be an actual image URL
      setVtoImage(result.data);
      setOpen(true);
    } catch (err) {
      setError(err.message || "Failed to generate outfit preview");
      setShowError(true);
    } finally {
      setIsGenerating(false);
    }
  }, [vtoImage, outfit?.items, user]);

  const handleOpenDialog = () => {
    if (!vtoImage) {
      handleGenerateVTO();
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <Card
        className="surface-panel dashboard__tryon-card"
        sx={{ height: "100%" }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            position: "relative",
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={1}>
            Virtual Try-On
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Preview how today's edit could sit on different silhouettes.
          </Typography>
          <Box
            component="img"
            src={vtoImage?.imageUrl || AVATAR_IMG}
            alt="Virtual model"
            className="dashboard__tryon-avatar"
            sx={{
              opacity: isGenerating ? 0.5 : 1,
              transition: "opacity 0.3s ease",
            }}
          />
          {isGenerating && (
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "200px",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            mb={2}
          >
            {isGenerating
              ? "Generating outfit preview..."
              : isCachedVTO
                ? "Using cached VTO image (no API call)"
                : vtoImage
                  ? "Male avatar locked for try-on consistency"
                  : "Using male avatar for try-on preview"}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<TryOutlined />}
            onClick={handleOpenDialog}
            fullWidth
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Try Outfit"}
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Virtual Try-On Preview</DialogTitle>
        <DialogContent>
          {vtoImage ? (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>
                AI-generated preview of your outfit:
              </Typography>
              {isCachedVTO && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Cached result loaded. No additional quota was used.
                </Typography>
              )}
              <Box
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  p: 2,
                  mb: 2,
                  textAlign: "center",
                  minHeight: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="img"
                  src={vtoImage.imageUrl}
                  alt="Generated virtual try-on"
                  sx={{
                    width: "100%",
                    maxWidth: 420,
                    borderRadius: 1,
                    objectFit: "contain",
                  }}
                />
              </Box>
            </>
          ) : (
            <DialogContentText>
              Virtual try-on uses AI to generate a preview of your selected
              outfit. Click "Generate" to create a personalized image.
            </DialogContentText>
          )}
          {outfit?.items?.length > 0 && (
            <Box mt={2}>
              <strong>Current outfit:</strong>
              <Typography variant="body2" color="text.secondary">
                {outfit.items.map((i) => i.name).join(", ")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
