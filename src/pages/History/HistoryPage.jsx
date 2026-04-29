import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useOutfit } from "../../hooks/useOutfit";
import "./History.scss";

const OCCASION_FILTERS = ["All", "Casual", "Work", "Party", "Date", "Sport"];

function getWornDate(entry) {
  return entry.wornAt || entry.acceptedAt || entry.date;
}

export default function HistoryPage() {
  const { history, historyLoading } = useOutfit();
  const [occasion, setOccasion] = useState("All");

  const cutoff = dayjs().subtract(14, "day");
  const recentHistory = useMemo(
    () =>
      history
        .filter((entry) => dayjs(getWornDate(entry)).isAfter(cutoff))
        .filter((entry) => occasion === "All" || entry.occasion === occasion),
    [history, cutoff, occasion],
  );

  const dayBuckets = useMemo(() => {
    return recentHistory.reduce((acc, entry) => {
      const key = dayjs(getWornDate(entry)).format("YYYY-MM-DD");
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [recentHistory]);

  const orderedDays = Object.keys(dayBuckets).sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <Box className="history page-container page-shell">
      <Box className="page-hero history__hero">
        <Box className="page-hero__copy">
          <Typography className="page-eyebrow">Wear timeline</Typography>
          <Typography variant="h1" className="page-title">
            Last 14 days.
          </Typography>
          <Typography className="page-subtitle">
            Review outfits that were worn recently and track cadence by
            occasion.
          </Typography>
        </Box>
        <Box className="page-actions history__hero-stats">
          <Box className="page-stat">
            <Typography className="page-stat__label">Looks Worn</Typography>
            <Typography className="page-stat__value">
              {recentHistory.length}
            </Typography>
          </Box>
          <Box className="page-stat">
            <Typography className="page-stat__label">Window</Typography>
            <Typography className="page-stat__value">14 days</Typography>
          </Box>
        </Box>
      </Box>

      <Card className="surface-panel history__filters-panel">
        <CardContent>
          <Box className="history__filters">
            {OCCASION_FILTERS.map((label) => (
              <Chip
                key={label}
                label={label}
                clickable
                color={label === occasion ? "primary" : "default"}
                variant={label === occasion ? "filled" : "outlined"}
                onClick={() => setOccasion(label)}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {historyLoading ? (
        <Card className="surface-panel">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Loading history...
            </Typography>
          </CardContent>
        </Card>
      ) : orderedDays.length ? (
        <Box className="history__timeline">
          {orderedDays.map((dayKey) => (
            <Card className="surface-panel history__day-card" key={dayKey}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={1.5}>
                  {dayjs(dayKey).format("dddd, MMMM D")}
                </Typography>
                <Grid container spacing={1.5}>
                  {dayBuckets[dayKey].map((entry) => (
                    <Grid item xs={12} sm={6} md={4} key={entry.id}>
                      <Card variant="outlined" className="history__entry-card">
                        <CardContent>
                          <Box className="history__entry-meta">
                            <Chip
                              size="small"
                              label={entry.occasion}
                              color="secondary"
                              variant="outlined"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {dayjs(getWornDate(entry)).format("h:mm A")}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {entry.items.map((item) => item.name).join(" · ")}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Alert severity="info">
          No worn outfit records in the last 14 days for{" "}
          <strong>{occasion}</strong>.
        </Alert>
      )}
    </Box>
  );
}
