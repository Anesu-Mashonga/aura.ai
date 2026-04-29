import africanAvatar from "../img/african-avatar.png";
import maleAvatar from "../img/male-avatar.png";
import blackBlazer from "../img/Black Blazer.jpg";
import blackChinos from "../img/Black Chinos.jpg";
import blackCurbChainNecklace from "../img/black curb chain necklace.jpg";
import blackLeatherJacket from "../img/Black Leather Jacket.jpg";
import blackShirt from "../img/black-shirt.jpg";
import blueJeans from "../img/Blue Jeans.jpg";
import blueLoafers from "../img/Blue Loafers.jpg";
import brownBodybag from "../img/brown bodybag.jpg";
import brownBoots from "../img/Brown Boots.jpg";
import darkSunglasses from "../img/dark sunglasses.jpg";
import graySweatpants from "../img/Gray sweatpants.jpg";
import greenCargo from "../img/Green Cargo.jpg";
import greyJacket from "../img/Grey Jacket.jpg";
import stripedShirt from "../img/striped-shirt.jpg";
import whiteCardigan from "../img/white cardigan.jpg";
import whiteShirt from "../img/white shirt.jpg";
import whiteTrainers from "../img/White Trainers.jpg";

const avatarChoices = [maleAvatar, africanAvatar];

export function getLocalAvatar(seed = "") {
  const normalizedSeed = String(seed).toLowerCase();
  const hash = [...normalizedSeed].reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );

  return avatarChoices[hash % avatarChoices.length] || maleAvatar;
}

export const LOCAL_AVATARS = {
  demo: maleAvatar,
  alternate: africanAvatar,
  virtualTryOn: [maleAvatar, africanAvatar],
};

export const WARDROBE_IMAGE_BY_NAME = {
  "White Oxford Shirt": whiteShirt,
  "Navy Blazer": blackBlazer,
  "Grey Chinos": blackChinos,
  "Classic White Tee": whiteCardigan,
  "Slim Fit Jeans": blueJeans,
  "White Sneakers": whiteTrainers,
  "Brown Leather Boots": brownBoots,
  "Black Watch": darkSunglasses,
  "Striped Polo": stripedShirt,
  "Black Joggers": graySweatpants,
  "Olive Bomber Jacket": greyJacket,
  "Leather Belt": blackCurbChainNecklace,
};

export const PRODUCT_IMAGE_BY_ID = {
  "prod-1": whiteCardigan,
  "prod-2": greenCargo,
  "prod-3": blueLoafers,
  "prod-4": brownBodybag,
};

export const QUICK_ADD_PRESET_IMAGES = {
  tee: blackShirt,
  jeans: blueJeans,
  sneakers: whiteTrainers,
  jacket: blackLeatherJacket,
};