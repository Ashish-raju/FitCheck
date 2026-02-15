import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
    RitualTab: undefined;
    WardrobeTab: undefined;
    ProfileTab: undefined;
};

export type RootStackParamList = {
    Void: undefined;
    Splash: undefined;
    Intro: undefined;
    Onboarding: undefined;
    Auth: undefined;
    Home: NavigatorScreenParams<TabParamList>;
    RitualDeck: undefined;
    Seal: undefined;
    Camera: undefined;
    ItemPreview: { item?: any; readonly?: boolean } | undefined;
    ItemDetailSheet: { item: any };
    Outfits: undefined;
    CreateOutfit: { outfitId?: string } | undefined;
    Social: undefined;
    AIStylist: undefined;
    SegmentationCorrection: {
        imageUri: string;
        maskUri: string;
        onConfirm: (uri: string) => void;
        onCancel: () => void
    };
    OutfitDetail: { outfitId: string };
    StylingCanvas: undefined;
};

// Helper for type-safe useNavigation
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
