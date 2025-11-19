import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Stars, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:3001/api';

export default function Rewards() {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<number>(0);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  // 🔹 Fetch tokens from backend using Firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTokens(currentUser);
      } else {
        setLoadingTokens(false);
        navigate("/login");
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTokens = async (currentUser: any) => {
    if (!currentUser) return;
    
    setLoadingTokens(true);
    try {
      // Use displayName, email (before @), or uid as fallback for student name
      const studentName = currentUser.displayName || 
                        currentUser.email?.split('@')[0] || 
                        currentUser.uid || 
                        'Unknown Student';
      const response = await axios.get(`${API_URL}/user/tokens/${encodeURIComponent(studentName)}`);
      setTokens(response.data.tokens || 0);
    } catch (error: any) {
      console.error("Error fetching tokens:", error);
      setTokens(0);
      if (error.response?.status !== 404) {
        toast.error("Failed to load stars. Please refresh the page.");
      }
    } finally {
      setLoadingTokens(false);
    }
  };

  // Gift card data
  const giftCards = [
    {
      id: 1,
      name: "Amazon Gift Card",
      price: 250,
      img: "https://www.frinza.com/assets/templatedata/images/products/70ba194c8251c1faeda6bae74e2d796a.jpg",
    },
      {
      id: 2,
      name: "Flipkart Gift Card",
      price: 250,
      img: "https://rukminim2.flixcart.com/image/832/832/xif0q/e-gift-voucher/8/a/u/open-anyone-flipkart-75-original-imahg2fen7vp4tsq.jpeg?q=70&crop=false",
    },
    {
      id: 3,
      name: "Google Play Gift Card",
      price: 300,
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwx3jwssWfZbhz7MfWbnliWvT5_dT1zZrfZw&s",
    },
    {
      id: 4,
      name: "Nike Gift Card",
      price: 350,
      img: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/daf1717e-dd3b-4855-abfb-96f2bd13e08e/GiftCard.png",
    },
    {
      id: 5,
      name: "Paytm Gift Card",
      price: 200,
      img: "data:image/png;base64,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",
    },
    {
      id: 6,
      name: "Spotify Premium Gift Card",
      price: 300,
      img: "https://m.media-amazon.com/images/I/41cntGGfjsL._SX679_.jpg",
    },
  ];

  // 🎁 Redeem gift card
  const handleRedeem = async (cardName: string, cost: number) => {
    if (!user) {
      toast.error("Please log in to redeem rewards");
      navigate("/login");
      return;
    }

    if (tokens < cost) {
      toast.error(`❌ You need ${cost} stars to redeem ${cardName}!`);
      return;
    }

    setIsRedeeming(true);

    try {
      // Use displayName, email (before @), or uid as fallback for student name
      const studentName = user.displayName || 
                         user.email?.split('@')[0] || 
                         user.uid || 
                         'Unknown Student';
      
      // Call backend to redeem tokens
      const response = await axios.post(`${API_URL}/user/redeem`, {
        studentName: studentName,
        gift: cardName,
        cost: cost
      });

      // Update local state with new token balance
      setTokens(response.data.tokens);
      toast.success(`🎉 Successfully redeemed ${cardName}!`);
      console.log(`Redeemed ${cardName} for ${cost} stars. Remaining: ${response.data.tokens}`);
    } catch (error: any) {
      console.error("Redeem error:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Failed to redeem. Please try again.");
      } else {
        toast.error("Failed to redeem. Please try again.");
      }
      // Refresh tokens to get correct balance
      if (user) {
        fetchTokens(user);
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10">
          🎁 My <span className="text-primary">Rewards</span>
        </h1>

        {/* Token balance */}
        <div className="text-center mb-8">
          <div className="inline-block bg-primary/10 px-6 py-3 rounded-xl">
            <Stars className="inline-block h-6 w-6 text-yellow-500 mr-2" />
            {loadingTokens ? (
              <Loader2 className="inline-block h-5 w-5 animate-spin text-primary mr-2" />
            ) : (
              <span className="font-semibold text-lg">{tokens} Stars Available</span>
            )}
          </div>
        </div>

        {/* Gift Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {giftCards.map((card) => (
            <Card
              key={card.id}
              className="border-border bg-card shadow-card rounded-2xl hover:shadow-lg transition-all"
            >
              <CardHeader>
                <CardTitle className="text-center text-xl font-semibold flex items-center justify-center gap-2">
                  <Gift className="h-5 w-5 text-yellow-500" />
                  {card.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <img
                  src={card.img}
                  alt={card.name}
                  className="h-32 w-auto mx-auto rounded-lg object-contain bg-white"
                />
                <p className="text-sm text-muted-foreground">
                  ⭐ <span className="font-medium">{card.price}</span> Stars Required
                </p>
                <Button
                  onClick={() => handleRedeem(card.name, card.price)}
                  disabled={isRedeeming}
                  className="w-full rounded-lg bg-primary text-white hover:opacity-90 transition-all"
                >
                  {isRedeeming ? "Processing..." : "Redeem Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="max-w-3xl mx-auto mt-12 text-center text-muted-foreground space-y-2">
          <p className="text-sm">
            ⭐ Earn stars by uploading study notes. You'll receive 50 stars when teachers approve your notes!
          </p>
          <p className="text-sm">
            🎁 Redeem your stars for exciting gift cards listed above!
          </p>
        </div>
      </div>
    </div>
  );
}
