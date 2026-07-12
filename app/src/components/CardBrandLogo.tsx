import type { ReactElement } from "react";
import { View } from "react-native";
import Svg, { Circle, Rect, Text as SvgText } from "react-native-svg";
import type { CardBrand } from "../utils/cardValidation";
import { colors } from "../theme";

type Props = {
  brand: CardBrand;
  size?: number;
};

const BRAND_LABELS: Record<CardBrand, string> = {
  VISA: "Visa card",
  MASTERCARD: "Mastercard card",
  AMEX: "American Express card",
  DINERS: "Diners Club card",
  DISCOVER: "Discover card",
  UNKNOWN: "Card",
};

const WIDTH = 40;
const HEIGHT = 26;

function VisaBadge() {
  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox="0 0 40 26">
      <Rect width={40} height={26} rx={4} fill="#1A1F71" />
      <SvgText
        x={20}
        y={17}
        fontSize={10}
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        VISA
      </SvgText>
    </Svg>
  );
}

function MastercardBadge() {
  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox="0 0 40 26">
      <Rect width={40} height={26} rx={4} fill="#F7F7F7" />
      <Circle cx={16} cy={13} r={8} fill="#EB001B" />
      <Circle cx={24} cy={13} r={8} fill="#F79E1B" opacity={0.9} />
    </Svg>
  );
}

function AmexBadge() {
  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox="0 0 40 26">
      <Rect width={40} height={26} rx={4} fill="#2E77BC" />
      <SvgText
        x={20}
        y={17}
        fontSize={8}
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        AMEX
      </SvgText>
    </Svg>
  );
}

function DinersBadge() {
  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox="0 0 40 26">
      <Rect width={40} height={26} rx={4} fill="#0079BE" />
      <Circle cx={20} cy={13} r={9} fill="#FFFFFF" />
      <Circle cx={20} cy={13} r={9} fill="#0079BE" opacity={0.35} />
    </Svg>
  );
}

function DiscoverBadge() {
  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox="0 0 40 26">
      <Rect width={40} height={26} rx={4} fill="#4D4D4D" />
      <Circle cx={30} cy={13} r={7} fill="#FF6000" />
      <SvgText
        x={16}
        y={17}
        fontSize={7}
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        DISC
      </SvgText>
    </Svg>
  );
}

function UnknownBadge() {
  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox="0 0 40 26">
      <Rect
        width={40}
        height={26}
        rx={4}
        fill={colors.border}
        stroke={colors.textMuted}
        strokeWidth={1}
      />
    </Svg>
  );
}

const BADGES: Record<CardBrand, () => ReactElement> = {
  VISA: VisaBadge,
  MASTERCARD: MastercardBadge,
  AMEX: AmexBadge,
  DINERS: DinersBadge,
  DISCOVER: DiscoverBadge,
  UNKNOWN: UnknownBadge,
};

export default function CardBrandLogo({ brand }: Props) {
  const Badge = BADGES[brand];
  const testId = `card-brand-logo-${brand.toLowerCase()}`;

  return (
    <View testID={testId} accessibilityLabel={BRAND_LABELS[brand]}>
      <Badge />
    </View>
  );
}
