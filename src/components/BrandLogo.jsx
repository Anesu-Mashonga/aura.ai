import { Box, Typography } from "@mui/material";

export default function BrandLogo({
  compact = false,
  centered = false,
  showSubtitle = true,
  titleVariant = "h5",
  subtitle = "AI wardrobe studio",
  className = "",
}) {
  const classes = [
    "brand-logo",
    compact ? "brand-logo--compact" : "",
    centered ? "brand-logo--centered" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Box className={classes}>
      <Box className="brand-logo__mark" aria-hidden="true">
        <Box
          component="span"
          className="brand-logo__orb brand-logo__orb--one"
        />
        <Box
          component="span"
          className="brand-logo__orb brand-logo__orb--two"
        />
        <Box component="span" className="brand-logo__core">
          A
        </Box>
      </Box>
      <Box className="brand-logo__copy">
        <Typography variant={titleVariant} className="brand-logo__wordmark">
          Aura.ai
        </Typography>
        {showSubtitle && (
          <Typography variant="caption" className="brand-logo__subtitle">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
