import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        textAlign: "center",
        gap: 2,
      }}
    >
      <BrandLogo centered showSubtitle={false} titleVariant="h5" />
      <Typography variant="h1" fontWeight={700} className="gradient-text">
        404
      </Typography>
      <Typography variant="h5" color="text.secondary">
        Page not found
      </Typography>
      <Button variant="contained" onClick={() => navigate("/dashboard")}>
        Go Home
      </Button>
    </Box>
  );
}
