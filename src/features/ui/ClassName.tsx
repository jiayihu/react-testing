import { ClassNames as EmotionClassNames } from '@emotion/react';
import { useThemeUI } from '@theme-ui/core';
import { css as themeUICss, ThemeUICSSObject } from '@theme-ui/css';
import React from 'react';

type Props = {
  children(props: { classname: (styles: ThemeUICSSObject) => string }): React.ReactNode;
};

/**
 * A render-prop component to get a CSS className from a ThemeUICSSObject
 */
export function ClassName(props: Props) {
  const { theme } = useThemeUI();

  return (
    <EmotionClassNames>
      {({ css: emotionCss }) =>
        props.children({
          classname: (styleObject: ThemeUICSSObject) => emotionCss(themeUICss(styleObject)(theme)),
        })
      }
    </EmotionClassNames>
  );
}
