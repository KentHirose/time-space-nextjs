import { NextPage } from "next";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { ja } from "date-fns/locale/ja";
import axios from "axios";
import { format } from "date-fns";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const Map = dynamic(() => import("../components/Map"), { ssr: false });
const SearchBox = dynamic(() => import("../components/SearchBox"), {
  ssr: false,
});

const generateGoogleCalendarUrl = (step: any) => {
  const baseUrl = "https://www.google.com/calendar/render";
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "yyyyMMdd'T'HHmmss");
  };
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${step.origin} から ${step.destination}まで (${step.transportation})`,
    details: `${step.origin} から ${step.destination}まで (${step.transportation}) by RouteSync`,
    location: step.origin,
    dates: `${formatDate(step.departure)}/${formatDate(step.arrival)}`, // 日付のフォーマットを変更
  });
  return `${baseUrl}?${params.toString()}`;
};

const Home: NextPage = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [originName, setOriginName] = useState<string>("");
  const [destination, setDestination] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationName, setDestinationName] = useState<string>("");
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 35.6764,
    lng: 139.65,
  });
  const [arrivalTime, setArrivalTime] = useState<Date | null>(null);
  const [route, setRoute] = useState<any[]>([]);
  const [registerName, setRegisterName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState<string>("");

  const handlePlacesChanged = useCallback(
    (
      places: google.maps.places.PlaceResult[],
      type: "origin" | "destination"
    ) => {
      if (places.length > 0 && places[0].geometry) {
        const location = {
          lat: places[0].geometry.location!.lat(),
          lng: places[0].geometry.location!.lng(),
        };

        if (type === "origin") {
          setOrigin(location);
        } else {
          setDestination(location);
        }

        if (places[0].geometry.viewport) {
          const bounds = new google.maps.LatLngBounds();
          places.forEach((place) => {
            if (place.geometry!.viewport) {
              bounds.union(place.geometry!.viewport);
            } else {
              bounds.extend(place.geometry!.location!);
            }
          });
          map?.fitBounds(bounds);
        } else {
          setCenter(location);
          map?.setZoom(15);
        }
      }
    },
    [map]
  );

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleRouteSearch = async () => {
    if (origin && destination && arrivalTime) {
      try {
        const response = await axios.get(
          "https://space-time-db.onrender.com/map",
          {
            params: {
              origin: `${origin.lat},${origin.lng}`,
              destination: `${destination.lat},${destination.lng}`,
              time: arrivalTime.toISOString(),
            },
          }
        );
        setRoute(response.data);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
  };

  const handleRouteRegister = async () => {
    if (origin && destination && registerName) {
      try {
        await axios.get("https://space-time-db.onrender.com/route", {
          params: {
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            name: registerName,
          },
        });
        alert("ルートが登録されました！");
      } catch (error) {
        console.error("Error registering route:", error);
        alert("Failed to register route.");
      }
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSearchRoute = async () => {
    try {
      const response = await axios.get("https://space-time-db.onrender.com/route_search", {
        params: {
          name: searchName,
        },
      });
      const data = response.data;
      setOriginName(data.origin);
      setDestinationName(data.destination);
      setOpen(false);
    } catch (error) {
      console.error("Error fetching route:", error);
      alert("Failed to fetch route.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        RouteSync
      </Typography>
      <SearchBox
        onPlacesChanged={(places) => handlePlacesChanged(places, "origin")}
        placeholder="出発地を検索"
        value={originName}
        onChange={(e) => setOriginName(e.target.value)}
      />
      <SearchBox
        onPlacesChanged={(places) => handlePlacesChanged(places, "destination")}
        placeholder="目的地を検索"
        value={destinationName}
        onChange={(e) => setDestinationName(e.target.value)}
      />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
        <DateTimePicker
          label="到着時刻"
          value={arrivalTime}
          onChange={(newValue) => setArrivalTime(newValue)}
        />
      </LocalizationProvider>
      <Button variant="contained" color="primary" onClick={handleRouteSearch}>
        ルート検索
      </Button>
      <Button variant="contained" color="secondary" onClick={handleOpenDialog}>
        登録されたデータを使用
      </Button>
      <Map
        center={center}
        markers={
          [origin, destination].filter(Boolean) as google.maps.LatLngLiteral[]
        }
        onLoad={handleMapLoad}
      />
      {route.length > 0 && (
        <div>
          <Typography variant="h6" component="h2" gutterBottom>
            ルート検索結果
          </Typography>
          <ul>
            {route.map((step, index) => (
              <li key={index}>
                {step.origin} から {step.destination} まで {step.transportation}{" "}
                で {step.departure} に出発し、{step.arrival} に到着
                <Button
                  variant="outlined"
                  color="secondary"
                  href={generateGoogleCalendarUrl(step)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  カレンダーに追加
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <Typography variant="h6" component="h2" gutterBottom>
          ルート情報を登録
        </Typography>
        <TextField
          label="登録名"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Typography variant="body1" gutterBottom>
          出発地: {origin ? `${origin.lat}, ${origin.lng}` : "未設定"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          目的地:{" "}
          {destination ? `${destination.lat}, ${destination.lng}` : "未設定"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRouteRegister}
          disabled={!origin || !destination || !registerName}
        >
          登録
        </Button>
      </div>
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>登録されたデータを使用</DialogTitle>
        <DialogContent>
          <TextField
            label="登録名"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleSearchRoute} color="primary">
            決定
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;
