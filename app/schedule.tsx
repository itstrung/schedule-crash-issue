import { useWindowDimensions } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef } from "react";

import {
  convert24HTo12H,
  convertMinuteOfDayTo12H,
  getCurrentMinutesOfDay,
  getHeightOfOneMinute,
} from "@/utils/schedule";
import Rive, { Alignment, Fit, type RiveRef } from "rive-react-native";

export type ScheduleArtist = {
  thumbnailUrl?: string;

  artistNameOnLine1: string;
  artistNameOnLine2: string;
  isPast: boolean;
  isSaved: boolean;
  time: string;
};
export type ScheduleSet = {
  artistHeight: number;
  artistPos: number;
  myArtist: ScheduleArtist;
  eventName: string;

  startTime: Date;
  endTime: Date;

  displayDate: string;
  stageName: string;
};
export type ScheduleStage = {
  displayDate: string;
  name: string;
  guestName?: string;
};

export type ScheduleDay = {
  displayDate: string;
  name: string;
};

export type ScheduleData = {
  days: ScheduleDay[];
  stages: ScheduleStage[];
  sets: ScheduleSet[];
  minHourToDisplay: number;
  maxHourToDisplay: number;
};

export const HOUR_OFFSET_FROM_FIRST_SET = 0;
export const HOUR_OFFSET_FROM_LAST_SET = 0;
export const DEFAULT_MIN_HOUR_TO_DISPLAY = 0;
export const DEFAULT_MAX_HOUR_TO_DISPLAY = 24;
export const MAX_NUMBER_OF_SETS_DISPLAYED_IN_STAGE = 12;
export const MAX_NUMBER_OF_STAGES_DISPLAYED_IN_DAY = 5;
export const MAX_NUMBER_OF_SETS_DISPLAYED_IN_LIST_VIEW = 7;

const getStageNamePath = (stageNumber: number) =>
  `STAGENAME${stageNumber}` as const;

export const getStagePath = (stageNumber: number) =>
  `STAGE${stageNumber}` as const;

const getSetPath = ({
  setNumber,
  stageNumber,
}: {
  stageNumber: number;
  setNumber: number;
}) => {
  return `${getStagePath(stageNumber)}/SETPOS${setNumber}` as const;
};

const getArtistPath = ({
  setNumber,
  stageNumber,
}: {
  stageNumber: number;
  setNumber: number;
}) => {
  return `${getSetPath({ setNumber, stageNumber })}/myArtist` as const;
};

const STATIC_PATHS = {
  TIME_FRAME: "timeFrame",
  DAYS: "DAYS",
} as const;

const DYNAMIC_PATHS = {
  STAGE: "STAGE",
  STAGE_NAME: "STAGENAME",
  SET: "SETPOS",
  ARTIST: "myArtist",
} as const;

const ROOT_PATH = "LIVENATION";

const INPUT_NAMES = {
  [STATIC_PATHS.TIME_FRAME]: {
    TOTAL_HOURS_DISPLAYED: "numHoursDisplayed",
    getHourNameInputName: (hourNumber: number) => `H${hourNumber}` as const,
  },
  [STATIC_PATHS.DAYS]: {
    TOTAL_DAYS_DISPLAYED: "numOfDays",
    SELECTED_DAY: "selectedDay",
    getDayNameInputName: (dayNumber: number): `dayOneString${string}` =>
      `dayOneString${dayNumber}`,
  },
  [DYNAMIC_PATHS.STAGE]: {
    TOTAL_SETS_DISPLAYED: "numOfSets",
    SELECTED_SET_NUMBER: "displayedArtist",
  },
  [DYNAMIC_PATHS.STAGE_NAME]: {
    STAGE_NAME: "stageName",
    GUEST_NAME: "guestName",
  },
  [DYNAMIC_PATHS.SET]: {
    POSITION: "artistPos",
    HEIGHT: "artistHeight",
  },
  [DYNAMIC_PATHS.ARTIST]: {
    NAME_LINE_1: "artistName",
    NAME_LINE_2: "artistName2",
    TIME: "time",
    IS_PAST: "isPast",
    IS_PAST_AND_SAVED: "isPastAndFav",
    IS_SAVED: "isFav",
    IS_NOT_SAVED: "isNotFav",
  },

  [ROOT_PATH]: {
    // position of the time indicator
    CURRENT_TIME_INDICATOR_POSITION: "currentTime", //  Integer, valid range 0–1440. Reflects the current time in minutes.
    // text on the time indicator
    CURRENT_TIME_INDICATOR_DISPLAY_TEXT: "curTimeHour",
    getTotalStagesDisplayedInDay: (dayNumber: number): `NumStageDay${string}` =>
      `NumStageDay${dayNumber}`,
    HIDE_TIME_INDICATOR: "displayCurrentTime",
  },
} as const satisfies Record<
  (typeof STATIC_PATHS)[keyof typeof STATIC_PATHS] &
    (typeof DYNAMIC_PATHS)[keyof typeof DYNAMIC_PATHS] &
    typeof ROOT_PATH,
  Record<string, string | Function>
>;

/**
 * Artboard "WIP" (PATH: ROOT)
 */

// Update the hour label in the vertical timeline
export const updateHoursName = (
  riveAnimation: RiveRef,
  {
    minHour,
  }: {
    minHour: number;
  }
): void => {
  for (let hourIndex = 0; hourIndex < 24; hourIndex++) {
    const hourValue = minHour + hourIndex;
    const hourName = convert24HTo12H(hourValue);

    const hourNumber = hourIndex + 1;
    const path =
      INPUT_NAMES[STATIC_PATHS.TIME_FRAME].getHourNameInputName(hourNumber);

    riveAnimation.setTextRunValueAtPath(
      path,
      hourName,
      STATIC_PATHS.TIME_FRAME
    );
  }
};

export const updateTimeIndicatorLabel = (riveAnimation: RiveRef): void => {
  const currentMinutesOfDay = getCurrentMinutesOfDay();

  riveAnimation.setTextRunValue(
    INPUT_NAMES[ROOT_PATH].CURRENT_TIME_INDICATOR_DISPLAY_TEXT,
    convertMinuteOfDayTo12H(currentMinutesOfDay)
  );
};

export const updateTimeIndicatorPosition = (
  riveAnimation: RiveRef,
  {
    minHour,
    maxHour,
  }: {
    minHour: number;
    maxHour: number;
  }
): void => {
  const currentMinutesOfDay = getCurrentMinutesOfDay();

  const currentHours = Math.floor(currentMinutesOfDay / 60);
  if (currentHours < minHour || currentHours > maxHour) {
    return;
  }

  const minMinutes = minHour * 60;

  const heightOfOneMinute = getHeightOfOneMinute({
    minHour: minHour,
    maxHour: maxHour,
  });

  const minutesSinceMin = currentMinutesOfDay - minMinutes;

  riveAnimation.setInputState(
    ROOT_PATH,
    INPUT_NAMES[ROOT_PATH].CURRENT_TIME_INDICATOR_POSITION,
    minutesSinceMin * heightOfOneMinute
  );
};

/**
 * Artboard "timeFrame" (PATH: /timeFrame)
 */
export const updateTotalNumberOfHoursDisplayed = ({
  riveAnimation,
  numHoursDisplayed,
}: {
  riveAnimation: RiveRef;
  numHoursDisplayed: number;
}): void => {
  riveAnimation.setInputStateAtPath(
    INPUT_NAMES[STATIC_PATHS.TIME_FRAME].TOTAL_HOURS_DISPLAYED,
    numHoursDisplayed,
    STATIC_PATHS.TIME_FRAME
  );
};
export const updateTimeIndicatorVisibility = (
  riveAnimation: RiveRef,
  {
    hide,
  }: {
    hide: boolean;
  }
): void => {
  riveAnimation.setInputState(
    ROOT_PATH,
    INPUT_NAMES[ROOT_PATH].HIDE_TIME_INDICATOR,
    hide
  );
};

/**
 * Artboard "DAYS" (PATH: /DAYS)
 */

export const updateSelectedDay = (
  riveAnimation: RiveRef,
  {
    selectedDayNumber,
  }: {
    selectedDayNumber: number;
  }
): void => {
  riveAnimation.setInputStateAtPath(
    INPUT_NAMES[STATIC_PATHS.DAYS].SELECTED_DAY,
    selectedDayNumber,
    STATIC_PATHS.DAYS
  );
};

export const updateDaysDisplayed = (
  riveAnimation: RiveRef,
  {
    days,
  }: {
    days: ScheduleDay[];
  }
): void => {
  const numOfDays = days.length;
  riveAnimation.setInputStateAtPath(
    INPUT_NAMES[STATIC_PATHS.DAYS].TOTAL_DAYS_DISPLAYED,
    numOfDays,
    STATIC_PATHS.DAYS
  );

  days.forEach((day, dayIndex) => {
    const dayNumber = dayIndex + 1;
    const inputName =
      INPUT_NAMES[STATIC_PATHS.DAYS].getDayNameInputName(dayNumber);

    riveAnimation.setTextRunValueAtPath(inputName, day.name, STATIC_PATHS.DAYS);
  });
};

export const updateNumberOfStagesDisplayedInDay = (
  riveAnimation: RiveRef,
  {
    dayNumber,
    numOfStages,
  }: {
    dayNumber: number;
    numOfStages: number;
  }
): void => {
  riveAnimation.setInputState(
    ROOT_PATH,
    INPUT_NAMES[ROOT_PATH].getTotalStagesDisplayedInDay(dayNumber),
    numOfStages
  );
};

export const updateStagesDisplayed = (
  riveAnimation: RiveRef,
  {
    stages,
  }: {
    stages: ScheduleStage[];
  }
): void => {
  stages.forEach((stage, stageIndex) => {
    const stageNumber = stageIndex + 1;

    // update stage name
    // Artboards "STAGENAME1" to "STAGENAME5" (PATH: ROOT)
    const stageNamePath = getStageNamePath(stageNumber);

    riveAnimation.setTextRunValueAtPath(
      INPUT_NAMES[DYNAMIC_PATHS.STAGE_NAME].STAGE_NAME,
      stage.name,
      stageNamePath
    );

    riveAnimation.setTextRunValueAtPath(
      INPUT_NAMES[DYNAMIC_PATHS.STAGE_NAME].GUEST_NAME,
      stage.guestName ?? "",
      stageNamePath
    );
  });
};

export const getSelectedSetNumber = async (
  riveAnimation: RiveRef
): Promise<{
  setNumber: number;
  stageNumber: number;
} | null> => {
  for (
    let stageNumber = 1;
    stageNumber <= MAX_NUMBER_OF_STAGES_DISPLAYED_IN_DAY;
    stageNumber++
  ) {
    const selectedSetNumberInStage = await getSelectedSetNumberInStage(
      riveAnimation,
      { stageNumber }
    );

    if (!selectedSetNumberInStage) {
      return null;
    }

    return { setNumber: selectedSetNumberInStage, stageNumber };
  }

  return null;
};

const getSelectedSetNumberInStage = async (
  riveAnimation: RiveRef,
  { stageNumber }: { stageNumber: number }
): Promise<number | null> => {
  const stagePath = getStagePath(stageNumber);

  return riveAnimation.getNumberStateAtPath(
    INPUT_NAMES[DYNAMIC_PATHS.STAGE].SELECTED_SET_NUMBER,
    stagePath
  );
};

export const resetAllSelectedSetNumberInStages = (riveAnimation: RiveRef) => {
  for (
    let stageNumber = 1;
    stageNumber <= MAX_NUMBER_OF_STAGES_DISPLAYED_IN_DAY;
    stageNumber++
  ) {
    updateSelectedSetNumberInStage(riveAnimation, {
      setNumber: 0,
      stageNumber,
    });
  }
};

export const updateSelectedSetNumberInStage = (
  riveAnimation: RiveRef,
  {
    setNumber,
    stageNumber,
  }: {
    setNumber: number;
    stageNumber: number;
  }
) => {
  const stagePath = getStagePath(stageNumber);

  riveAnimation.setInputStateAtPath(
    INPUT_NAMES[DYNAMIC_PATHS.STAGE].SELECTED_SET_NUMBER,
    setNumber,
    stagePath
  );
};

/**
 * Artboards "SETPOS1" through "SETPOS12" (PATH: STAGEX/SETPOSX)
 */
export const updateSetsDisplayedInStage = (
  riveAnimation: RiveRef,
  {
    stageNumber, // starts from 1
    sets,
  }: {
    stageNumber: number;
    sets: ScheduleSet[];
  }
) => {
  // Artboards "STAGE1" through "STAGE5" (PATH: STAGEX)
  const stagePath = getStagePath(stageNumber);

  // update number of sets displayed in a stage
  riveAnimation.setInputStateAtPath(
    INPUT_NAMES[DYNAMIC_PATHS.STAGE].TOTAL_SETS_DISPLAYED,
    MAX_NUMBER_OF_SETS_DISPLAYED_IN_STAGE,
    stagePath
  );

  for (
    let setNumber = 1;
    setNumber <= MAX_NUMBER_OF_SETS_DISPLAYED_IN_STAGE;
    setNumber++
  ) {
    // Even if we have fewer than 12 sets, we still need to update all the remaining set with empty data to property display them
    const setPath = getSetPath({ setNumber, stageNumber });
    const set = sets.at(setNumber - 1);

    riveAnimation.setInputStateAtPath(
      INPUT_NAMES[DYNAMIC_PATHS.SET].POSITION,
      set?.artistPos ?? 0,
      setPath
    );
    riveAnimation.setInputStateAtPath(
      INPUT_NAMES[DYNAMIC_PATHS.SET].HEIGHT,
      set?.artistHeight ?? 0,
      setPath
    );

    if (set) {
      updateArtistDisplayed(riveAnimation, {
        setNumber,
        stageNumber,
        artist: set.myArtist,
      });
    }
  }
};

const updateArtistDisplayed = (
  riveAnimation: RiveRef,
  {
    stageNumber,
    setNumber,
    artist,
  }: {
    stageNumber: number;
    setNumber: number;
    artist: ScheduleArtist;
  }
) => {
  const artistPath = getArtistPath({ setNumber, stageNumber });

  riveAnimation.setTextRunValueAtPath(
    INPUT_NAMES[DYNAMIC_PATHS.ARTIST].NAME_LINE_1,
    artist.artistNameOnLine1 + "\r",
    artistPath
  );

  riveAnimation.setTextRunValueAtPath(
    INPUT_NAMES[DYNAMIC_PATHS.ARTIST].NAME_LINE_2,
    artist.artistNameOnLine2 + "\r",
    artistPath
  );

  riveAnimation.setTextRunValueAtPath(
    INPUT_NAMES[DYNAMIC_PATHS.ARTIST].TIME,
    artist.time,
    artistPath
  );
  const isPastAndSaved = artist.isPast && artist.isSaved;

  riveAnimation.setInputStateAtPath(
    INPUT_NAMES[DYNAMIC_PATHS.ARTIST].IS_PAST_AND_SAVED,
    isPastAndSaved,
    artistPath
  );

  if (isPastAndSaved) {
    return;
  }

  riveAnimation.setInputStateAtPath(
    INPUT_NAMES[DYNAMIC_PATHS.ARTIST].IS_PAST,
    artist.isPast,
    artistPath
  );

  // TODO: isSaved sometimes is not updated!
  updateArtistIsSavedState(riveAnimation, {
    stageNumber,
    setNumber,
    isSaved: artist.isSaved,
  });
};

export const updateArtistIsSavedState = (
  riveAnimation: RiveRef,
  {
    stageNumber,
    setNumber,
    isSaved,
  }: {
    stageNumber: number;
    setNumber: number;
    isSaved: boolean;
  }
) => {
  const artistPath = getArtistPath({ setNumber, stageNumber });

  const isSavedPath = isSaved
    ? INPUT_NAMES[DYNAMIC_PATHS.ARTIST].IS_SAVED
    : INPUT_NAMES[DYNAMIC_PATHS.ARTIST].IS_NOT_SAVED;

  riveAnimation.fireStateAtPath(isSavedPath, artistPath);
};

const initRive = (riveAnimation: RiveRef) => {
  console.log("Rive animation loaded");
  updateTotalNumberOfHoursDisplayed({
    riveAnimation,
    numHoursDisplayed: DEFAULT_MAX_HOUR_TO_DISPLAY,
  });

  updateDaysDisplayed(riveAnimation, {
    days: [
      { displayDate: "2023-10-01", name: "Day 1" },

      { displayDate: "2023-10-02", name: "Day 2" },
    ],
  });
};

export default function ScheduleScreen() {
  const { width, height } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const hasInit = useRef(false);
  const riveRef = useRef<RiveRef>(null);
  return (
    <ThemedView style={{ flex: 1 }}>
      <Rive
        onPlay={() => {
          if (!riveRef.current || hasInit.current) {
            return;
          }
          initRive(riveRef.current);
          hasInit.current = true;
        }}
        ref={riveRef}
        style={{
          width,
          height,
        }}
        fit={Fit.Contain}
        alignment={Alignment.Center}
        resourceName="schedule"
        stateMachineName="LIVENATION"
      />
    </ThemedView>
  );
}
