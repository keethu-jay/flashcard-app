import "styled-components";

declare module "styled-components" {
    export interface DefaultTheme {
        colors: {
            primary: string;
            select: string;
            background: string;
            frontText: string;
            backText: string;
            outline: string;
        };
        fonts: {
            heading: string;
            body: string;
        };
    }
}
