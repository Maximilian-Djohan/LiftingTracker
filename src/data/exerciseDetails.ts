import type { Exercise, ExerciseDetails } from '../types'

/** Alternatives computed from the catalog: same category and shared muscles. */
export function similarExercises(ex: Exercise, all: Exercise[], count = 4): Exercise[] {
  const scored = all
    .map(o => {
      if (o.id === ex.id) return { o, s: -1 }
      let s = 0
      if (o.category === ex.category) s += 2
      s += o.muscleGroups.filter(m => ex.muscleGroups.includes(m)).length
      if (o.muscleGroups[0] && o.muscleGroups[0] === ex.muscleGroups[0]) s += 2
      return { o, s }
    })
    .filter(x => x.s >= 3)
    .sort((a, b) => b.s - a.s)
  return scored.slice(0, count).map(x => x.o)
}

export const EXERCISE_DETAILS: Record<string, ExerciseDetails> = {
  // Chest
  'bench-press': {
    description: 'The classic barbell press for overall chest, front delt, and tricep strength.',
    instructions: [
      'Lie flat with your eyes under the bar, feet planted, shoulder blades pinched together and down.',
      'Grip slightly wider than shoulder width and unrack the bar over your chest.',
      'Lower with control to your mid chest, elbows tucked to roughly 45 to 70 degrees.',
      'Press back up in a slight arc toward your shoulders until your arms are extended.',
    ],
    tips: ['Keep your glutes on the bench and maintain a slight arch.', 'Do not flare the elbows to 90 degrees; it stresses the shoulders.'],
  },
  'incline-bench': {
    description: 'Barbell press on an incline bench that shifts emphasis to the upper chest.',
    instructions: [
      'Set the bench to a 30 to 45 degree incline and lie back with feet planted.',
      'Grip slightly wider than shoulder width and unrack over your upper chest.',
      'Lower with control to just below the collarbones.',
      'Press straight up until your arms are extended.',
    ],
    tips: ['Steeper inclines shift the work toward the shoulders.', 'Keep the shoulder blades pinned throughout.'],
  },
  'decline-barbell-bench-press': {
    description: 'Barbell press on a decline bench that emphasizes the lower chest.',
    instructions: [
      'Secure your legs on the decline bench and lie back.',
      'Grip slightly wider than shoulder width and unrack over your lower chest.',
      'Lower with control to the base of the chest.',
      'Press back up until your arms are extended.',
    ],
    tips: ['Use a spotter to hand you the bar; the unrack is awkward.', 'Keep the range of motion controlled at the bottom.'],
  },
  'dumbbell-bench-press': {
    description: 'Flat pressing with dumbbells for a longer range of motion and even side-to-side strength.',
    instructions: [
      'Lie flat holding a dumbbell in each hand at chest level.',
      'Plant your feet and pinch your shoulder blades together.',
      'Press the dumbbells up and slightly together until your arms are extended.',
      'Lower with control until you feel a stretch across your chest.',
    ],
    tips: ['Kick the dumbbells up with your knees to get into position safely.', 'Do not let the dumbbells drift out wide at the bottom.'],
  },
  'incline-dumbbell-bench-press': {
    description: 'Incline dumbbell press targeting the upper chest with a deep stretch.',
    instructions: [
      'Set the bench to a 30 to 45 degree incline and sit back with dumbbells at your shoulders.',
      'Press the dumbbells up and slightly together over your upper chest.',
      'Lower with control until your elbows are just below the bench line.',
      'Repeat without bouncing at the bottom.',
    ],
    tips: ['Keep your wrists stacked over your elbows.', 'A slight inward turn of the dumbbells is easier on the shoulders.'],
  },
  'decline-dumbbell-bench-press': {
    description: 'Decline dumbbell press emphasizing the lower chest.',
    instructions: [
      'Secure your legs on the decline bench with dumbbells at your chest.',
      'Press the dumbbells up until your arms are extended over the lower chest.',
      'Lower with control to a comfortable stretch.',
      'Keep the movement smooth and repeat.',
    ],
    tips: ['Have a partner hand you the dumbbells if the setup is awkward.', 'Control the bottom position; do not chase excessive depth.'],
  },
  'smith-machine-bench-press': {
    description: 'Flat pressing on the smith machine with a fixed bar path for stable, heavy loading.',
    instructions: [
      'Set the bench so the bar lands at your mid chest.',
      'Grip slightly wider than shoulder width and rotate the bar to unrack.',
      'Lower with control to your chest.',
      'Press straight up and re-hook the bar when finished.',
    ],
    tips: ['Line up carefully; the fixed path punishes a bad setup.', 'Great for pushing close to failure without a spotter.'],
  },
  'incline-smith-machine-bench-press': {
    description: 'Fixed-path incline press that isolates the upper chest with minimal stabilizer demand.',
    instructions: [
      'Set an incline bench under the smith bar so it touches just below your collarbones.',
      'Unrack with a grip slightly wider than shoulder width.',
      'Lower with control to the upper chest.',
      'Press straight up until your arms are extended.',
    ],
    tips: ['Adjust the bench position before loading plates.', 'Keep the shoulder blades pinned to the bench.'],
  },
  'reverse-grip-incline-smith-machine-bench-press': {
    description: 'Incline smith press with an underhand grip, biasing the upper chest fibers hard.',
    instructions: [
      'Set an incline bench under the smith bar and lie back.',
      'Take an underhand grip slightly wider than shoulder width.',
      'Unrack carefully and lower the bar to your upper chest.',
      'Press straight up, keeping the wrists neutral and elbows tracking forward.',
    ],
    tips: ['Start light; the grip feels unusual at first.', 'Wrap the thumbs fully around the bar for safety.'],
  },
  'decline-smith-machine-bench-press': {
    description: 'Fixed-path decline press emphasizing the lower chest.',
    instructions: [
      'Set a decline bench under the smith bar so it lands at your lower chest.',
      'Unrack with a grip slightly wider than shoulder width.',
      'Lower with control and press straight back up.',
      'Re-hook the bar at the end of the set.',
    ],
    tips: ['Check the bar path with an empty bar first.', 'Keep your elbows from flaring at the bottom.'],
  },
  'machine-chest-press': {
    description: 'Seated machine press for safe, stable chest loading with easy progression.',
    instructions: [
      'Adjust the seat so the handles line up with your mid chest.',
      'Grip the handles with elbows about 45 degrees from your body.',
      'Press forward until your arms are extended without locking hard.',
      'Return with control until you feel a chest stretch.',
    ],
    tips: ['Keep your back against the pad the whole set.', 'Use a full range; do not cut the return short.'],
  },
  'incline-machine-chest-press': {
    description: 'Machine press angled upward to target the upper chest.',
    instructions: [
      'Set the seat so the handles sit at upper-chest height.',
      'Press up and forward until your arms are extended.',
      'Lower with control to a full stretch.',
      'Keep your shoulders down away from your ears.',
    ],
    tips: ['Drive with the chest, not by shrugging the shoulders.', 'Pause briefly in the stretched position.'],
  },
  'decline-machine-chest-press': {
    description: 'Machine press angled downward to emphasize the lower chest.',
    instructions: [
      'Adjust the seat so the handles line up with your lower chest.',
      'Press forward and slightly down until your arms are extended.',
      'Return with control to a comfortable stretch.',
      'Keep constant tension through the set.',
    ],
    tips: ['Do not let the weight stack touch down between reps.', 'Keep your chest tall against the pad.'],
  },
  'push-up': {
    description: 'The fundamental bodyweight press for chest, triceps, and core.',
    instructions: [
      'Set your hands slightly wider than shoulder width, body in a straight line.',
      'Lower your chest to just above the floor, elbows about 45 degrees from your body.',
      'Press back up to full arm extension.',
      'Keep your hips level throughout.',
    ],
    tips: ['Squeeze your glutes to keep the body rigid.', 'Elevate your hands to make it easier, or your feet to make it harder.'],
  },
  'diamond-push-up': {
    description: 'Close-hand push up that shifts the load onto the triceps and inner chest.',
    instructions: [
      'Place your hands under your chest with thumbs and index fingers forming a diamond.',
      'Keep your body in a straight line from head to heels.',
      'Lower your chest to your hands, elbows staying close to your sides.',
      'Press back up to full extension.',
    ],
    tips: ['Move the hands slightly apart if your wrists complain.', 'Keep the elbows tucked; do not let them wing out.'],
  },
  dips: {
    description: 'Bodyweight press on parallel bars hitting the lower chest and triceps.',
    instructions: [
      'Support yourself on the bars with arms extended.',
      'Lean slightly forward and lower until your upper arms are about parallel to the floor.',
      'Press back up to full extension.',
      'Keep the shoulders down away from the ears.',
    ],
    tips: ['More forward lean means more chest; upright means more triceps.', 'Add weight with a belt once bodyweight is comfortable.'],
  },
  'cable-chest-fly': {
    description: 'Cable fly that keeps constant tension on the chest through the full arc.',
    instructions: [
      'Set the pulleys at chest height and stand centered with one foot forward.',
      'Hold the handles with a slight elbow bend.',
      'Bring your hands together in a hugging arc in front of your chest.',
      'Return with control until you feel a stretch.',
    ],
    tips: ['Keep the elbow angle fixed; this is not a press.', 'Squeeze the chest for a second at the midpoint.'],
  },
  'dumbbell-chest-fly': {
    description: 'Lying dumbbell fly for a deep chest stretch and isolation.',
    instructions: [
      'Lie flat holding dumbbells over your chest, palms facing each other.',
      'With a slight elbow bend, open your arms in a wide arc.',
      'Lower until you feel a strong chest stretch.',
      'Bring the dumbbells back together over your chest.',
    ],
    tips: ['Go lighter than you think; the stretch position is demanding.', 'Do not turn it into a press by bending the elbows more.'],
  },
  'pec-deck': {
    description: 'Machine fly that isolates the chest with a fixed, safe arc.',
    instructions: [
      'Set the seat so your forearms or hands sit level with your mid chest.',
      'Bring the pads or handles together in front of you.',
      'Squeeze the chest hard at the midpoint.',
      'Return with control to a full stretch.',
    ],
    tips: ['Keep your back against the pad.', 'Use a slow return; the stretch half is where growth lives.'],
  },
  'seated-low-to-high-cable-fly': {
    description: 'Seated cable fly sweeping from low to high to bias the upper chest.',
    instructions: [
      'Set the pulleys low and sit centered between them.',
      'With a slight elbow bend, sweep the handles up and together to eye level.',
      'Squeeze the upper chest at the top.',
      'Lower with control back to the start.',
    ],
    tips: ['Think of scooping up and in, not pressing.', 'Keep the shoulders down as the hands rise.'],
  },
  'dumbbell-pullover': {
    description: 'Single-dumbbell arc over the head that stretches the chest and lats together.',
    instructions: [
      'Lie across or along a bench holding one dumbbell over your chest with both hands.',
      'With slightly bent arms, lower the weight in an arc behind your head.',
      'Stop at a deep but comfortable stretch.',
      'Pull the dumbbell back over your chest.',
    ],
    tips: ['Keep the hips down to maximize the stretch.', 'Do not bend the elbows as you fatigue.'],
  },
  'machine-pullover': {
    description: 'Machine version of the pullover with constant tension on chest and lats.',
    instructions: [
      'Set the seat so your shoulders line up with the machine pivot.',
      'Grip the bar or pads overhead.',
      'Pull down in an arc to your midsection.',
      'Return with control to a full overhead stretch.',
    ],
    tips: ['Drive with the elbows rather than pulling with the hands.', 'Move deliberately at the stretched top position.'],
  },

  // Back
  'barbell-row': {
    description: 'Bent-over barbell row, the heavy builder for the whole back.',
    instructions: [
      'Hinge at the hips with a flat back until your torso is near 45 degrees.',
      'Grip the bar just outside your knees.',
      'Pull the bar to your lower ribs, elbows driving back.',
      'Lower with control without letting the torso rise.',
    ],
    tips: ['Brace your core; the position is half the exercise.', 'Do not jerk the weight with your lower back.'],
  },
  'dumbbell-row': {
    description: 'One-arm row with a hand braced on a bench for strict lat work.',
    instructions: [
      'Place one knee and hand on a bench, other foot planted.',
      'Let the dumbbell hang with a long arm and a flat back.',
      'Pull the dumbbell to your hip, elbow staying close.',
      'Lower to a full stretch.',
    ],
    tips: ['Row toward the hip, not the shoulder, to hit the lats.', 'Avoid rotating the torso open at the top.'],
  },
  'cable-row': {
    description: 'Seated cable row for mid-back thickness with constant tension.',
    instructions: [
      'Sit tall with knees slightly bent, holding the handle with arms long.',
      'Pull the handle to your stomach, driving the elbows back.',
      'Squeeze the shoulder blades together.',
      'Return with control, letting the shoulder blades glide forward.',
    ],
    tips: ['Keep the torso mostly still; a slight lean is fine.', 'Do not shrug as you pull.'],
  },
  'machine-chest-supported-row': {
    description: 'Row with the chest braced on a pad, isolating the back and protecting the spine.',
    instructions: [
      'Set the seat so the handles are reachable with your chest on the pad.',
      'Pull the handles toward you, elbows driving back.',
      'Squeeze the shoulder blades together at the end.',
      'Return with control to a full stretch.',
    ],
    tips: ['Keep the chest glued to the pad; no heaving.', 'Pick the grip that lets you feel the mid back best.'],
  },
  'dumbbell-chest-supported-row': {
    description: 'Dumbbell row lying chest-down on an incline bench for strict, spine-friendly back work.',
    instructions: [
      'Lie chest-down on a low incline bench with a dumbbell in each hand.',
      'Let the arms hang long.',
      'Row both dumbbells up, elbows driving toward the ceiling.',
      'Lower with a full stretch at the bottom.',
    ],
    tips: ['Keep the chest pressed into the pad throughout.', 'Pause briefly at the top for a stronger contraction.'],
  },
  'barbell-chest-supported-row': {
    description: 'Barbell row performed chest-down on an incline bench, removing lower-back strain.',
    instructions: [
      'Lie chest-down on an incline bench holding the bar beneath you.',
      'Row the bar up until it nears the bench.',
      'Squeeze the shoulder blades hard.',
      'Lower under control to a dead hang.',
    ],
    tips: ['Use smaller plates so the range is not cut short.', 'Do not lift the chest off the pad to cheat the rep.'],
  },
  't-bar-row': {
    description: 'Landmine-style row for heavy mid-back loading.',
    instructions: [
      'Straddle the bar and hinge to grab the handles with a flat back.',
      'Pull the weight to your chest, elbows driving back.',
      'Squeeze the shoulder blades at the top.',
      'Lower with control without standing up.',
    ],
    tips: ['Keep the knees soft and hips back.', 'Do not let the plates bounce off your chest.'],
  },
  'machine-row': {
    description: 'Seated machine row for simple, stable back training.',
    instructions: [
      'Adjust the seat so the handles sit at mid-torso height.',
      'Pull the handles to your body, driving the elbows back.',
      'Squeeze the shoulder blades together.',
      'Return with control to a full stretch.',
    ],
    tips: ['Keep the movement strict; the machine invites momentum.', 'Try both overhand and neutral grips.'],
  },
  'wide-grip-machine-row': {
    description: 'Machine row with a wide, high-elbow grip biasing the upper back and rear delts.',
    instructions: [
      'Take the wide handles with elbows lifted out to the sides.',
      'Pull toward your upper chest.',
      'Squeeze between the shoulder blades.',
      'Return with control.',
    ],
    tips: ['Keep the elbows high to keep tension on the upper back.', 'Lighter weight, stricter form works best here.'],
  },
  'close-grip-machine-row': {
    description: 'Machine row with a narrow neutral grip emphasizing the lats.',
    instructions: [
      'Grip the narrow handles with palms facing each other.',
      'Pull to your stomach with elbows tight to your sides.',
      'Squeeze the lats at the end of the pull.',
      'Return slowly to a full stretch.',
    ],
    tips: ['Think elbows to hips to load the lats.', 'Do not lean back to finish reps.'],
  },
  'lat-pulldown': {
    description: 'Wide-grip pulldown for lat width.',
    instructions: [
      'Grip the bar wider than shoulder width and sit with thighs secured.',
      'Pull the bar to your upper chest while leaning back slightly.',
      'Squeeze the lats with elbows driving down and back.',
      'Return with control to a full hang.',
    ],
    tips: ['Do not pull behind the neck.', 'Lead with the elbows, not the hands.'],
  },
  'close-grip-lat-pulldown': {
    description: 'Pulldown with a narrow grip for a longer range and strong lat stretch.',
    instructions: [
      'Attach a close neutral-grip handle and sit with thighs secured.',
      'Pull the handle to the top of your chest.',
      'Keep the chest tall as the elbows drive down.',
      'Return slowly to full arm extension.',
    ],
    tips: ['Let the lats stretch fully at the top of each rep.', 'Avoid rocking backward for momentum.'],
  },
  'pull-up': {
    description: 'Overhand bodyweight pull for lat and upper-body strength.',
    instructions: [
      'Hang from the bar with an overhand grip just wider than shoulders.',
      'Pull your chest toward the bar, elbows driving down.',
      'Get your chin over the bar.',
      'Lower with control to a full hang.',
    ],
    tips: ['Start from a dead hang each rep.', 'Use band assistance or negatives to build up.'],
  },
  'chin-up': {
    description: 'Underhand pull up that adds strong bicep involvement.',
    instructions: [
      'Hang with an underhand grip at shoulder width.',
      'Pull your chin over the bar, keeping the chest tall.',
      'Squeeze at the top.',
      'Lower with control to full extension.',
    ],
    tips: ['Keep the shoulders down as you initiate.', 'Slightly easier than pull ups; a good place to start.'],
  },
  'kelso-shrug': {
    description: 'Chest-supported shrug that retracts the shoulder blades to build the mid traps.',
    instructions: [
      'Lie chest-down on an incline bench holding dumbbells with long arms.',
      'Without bending the elbows, pull the shoulder blades back and together.',
      'Hold the squeeze for a second.',
      'Let the shoulder blades protract fully to reset.',
    ],
    tips: ['The arms never pull; only the shoulder blades move.', 'Light weight and a hard squeeze beat heavy sloppy reps.'],
  },
  'keenan-flaps-frontal': {
    description: 'Chest-supported arm sweep in the frontal plane for the upper back and rear delts.',
    instructions: [
      'Lie chest-down on an incline bench with light dumbbells hanging.',
      'With soft elbows, sweep the arms out to the sides toward shoulder height.',
      'Squeeze the upper back at the top.',
      'Lower with control back under the bench.',
    ],
    tips: ['Very light weight; this is a finesse movement.', 'Keep the neck relaxed and chest on the pad.'],
  },
  'keenan-flaps-sagittal': {
    description: 'Chest-supported arm sweep in the sagittal plane for upper back and traps.',
    instructions: [
      'Lie chest-down on an incline bench with light dumbbells hanging.',
      'With soft elbows, sweep the arms forward and up, then back toward your hips.',
      'Control the arc in both directions.',
      'Keep the shoulder blades active throughout.',
    ],
    tips: ['Move slowly; momentum ruins it.', 'Think of drawing a long arc with each hand.'],
  },
  shrug: {
    description: 'Straight up-and-down shrug for the upper traps.',
    instructions: [
      'Stand holding a barbell or dumbbells with long arms.',
      'Lift your shoulders straight up toward your ears.',
      'Hold the top for a second.',
      'Lower fully to a dead hang.',
    ],
    tips: ['Do not roll the shoulders; straight up and down.', 'A full stretch at the bottom matters more than load.'],
  },
  'back-extension': {
    description: 'Hip hinge over a pad to strengthen the lower back, glutes, and hamstrings.',
    instructions: [
      'Set the pad at your hip crease and hook your ankles in.',
      'Lower your torso with a flat back until you feel a hamstring stretch.',
      'Raise your torso until your body forms a straight line.',
      'Avoid hyperextending past neutral.',
    ],
    tips: ['Squeeze the glutes at the top rather than arching the spine.', 'Hold a plate to your chest to progress.'],
  },
  // Shoulders
  'barbell-shoulder-press': {
    description: 'Seated or standing barbell press for overall shoulder mass.',
    instructions: [
      'Hold the bar at your collarbones with a grip just outside the shoulders.',
      'Brace your core and press the bar straight overhead.',
      'Move your head slightly back as the bar passes your face.',
      'Lower with control back to the collarbones.',
    ],
    tips: ['Squeeze the glutes to protect the lower back when standing.', 'Finish with the bar stacked over your mid-foot.'],
  },
  'dumbbell-shoulder-press': {
    description: 'Overhead dumbbell press allowing a natural pressing arc.',
    instructions: [
      'Sit or stand with dumbbells at shoulder height, palms forward or slightly turned in.',
      'Press the dumbbells up and slightly together overhead.',
      'Stop just short of a hard lockout.',
      'Lower with control to shoulder height.',
    ],
    tips: ['Keep the ribs down; do not flare them to fake range.', 'A slight palm turn is friendlier on the shoulders.'],
  },
  'machine-shoulder-press': {
    description: 'Guided overhead press for stable, safe shoulder loading.',
    instructions: [
      'Set the seat so the handles start at shoulder height.',
      'Press up until your arms are extended without slamming the lockout.',
      'Lower with control back to the start.',
      'Keep your back against the pad.',
    ],
    tips: ['Great for pushing hard without a spotter.', 'Do not let the weight stack rest between reps.'],
  },
  'arnold-press': {
    description: 'Rotating dumbbell press that works the shoulders through a bigger arc.',
    instructions: [
      'Start with dumbbells at shoulder height, palms facing you.',
      'Press up while rotating the palms to face forward.',
      'Finish extended overhead.',
      'Reverse the rotation on the way down.',
    ],
    tips: ['Rotate smoothly through the middle of the press.', 'Use less weight than a regular press.'],
  },
  'overhead-press': {
    description: 'The standing strict barbell press, a full-body strength staple.',
    instructions: [
      'Stand with the bar at your collarbones, grip just outside the shoulders.',
      'Brace hard and press the bar straight up.',
      'Push your head through once the bar clears your face.',
      'Lower with control to the starting position.',
    ],
    tips: ['No leg drive; that would make it a push press.', 'Keep the bar path vertical over mid-foot.'],
  },
  'behind-the-neck-press': {
    description: 'Overhead press lowered behind the head; demands good shoulder mobility.',
    instructions: [
      'Sit with the bar resting across your upper traps.',
      'Grip wider than shoulder width.',
      'Press straight up to full extension.',
      'Lower with control to the base of the skull or upper traps.',
    ],
    tips: ['Skip this one if your shoulders lack the mobility.', 'Keep the range shallow at first.'],
  },
  'landmine-press': {
    description: 'Angled one-arm press with a landmine bar, easy on cranky shoulders.',
    instructions: [
      'Hold the end of the bar at your shoulder, staggered stance.',
      'Press up and forward along the bar’s arc.',
      'Finish with the arm extended.',
      'Lower with control back to the shoulder.',
    ],
    tips: ['Brace the core; the angle wants to rotate you.', 'Great substitute when overhead pressing hurts.'],
  },
  'lateral-raise': {
    description: 'The staple dumbbell raise for side delt width.',
    instructions: [
      'Stand with dumbbells at your sides, slight elbow bend.',
      'Raise the arms out to the sides to shoulder height.',
      'Lead with the elbows, pinkies slightly up.',
      'Lower with control.',
    ],
    tips: ['Lighter and stricter beats heavy swinging.', 'Pause briefly at the top.'],
  },
  'cable-lateral-raise': {
    description: 'Lateral raise on a low cable with tension from the very bottom.',
    instructions: [
      'Stand side-on to a low pulley, handle in the far hand.',
      'Raise the arm out to shoulder height with a soft elbow.',
      'Control the descent across your body.',
      'Complete all reps, then switch sides.',
    ],
    tips: ['The cable loads the bottom half a dumbbell misses.', 'Stay tall; do not lean away.'],
  },
  'machine-lateral-raise': {
    description: 'Machine raise that locks the movement path for pure side delt work.',
    instructions: [
      'Adjust the seat so the pads sit just above your elbows.',
      'Raise the arms out to shoulder height.',
      'Pause briefly at the top.',
      'Lower with control.',
    ],
    tips: ['Drive with the elbows, not the hands.', 'Perfect for drop sets.'],
  },
  'incline-dumbbell-y-raise': {
    description: 'Chest-supported Y-shaped raise for lower traps and healthy shoulders.',
    instructions: [
      'Lie chest-down on an incline bench with light dumbbells.',
      'Raise the arms up and forward into a Y position, thumbs up.',
      'Squeeze at the top without shrugging.',
      'Lower with control.',
    ],
    tips: ['Very light weight; this is a precision movement.', 'Keep the neck long and relaxed.'],
  },
  'dumbbell-front-raise': {
    description: 'Front raise isolating the front delts.',
    instructions: [
      'Stand with dumbbells in front of your thighs.',
      'Raise one or both arms straight forward to shoulder height.',
      'Pause briefly.',
      'Lower with control.',
    ],
    tips: ['Do not rock the torso to swing the weight.', 'Most pressers need little extra front delt work; keep volume modest.'],
  },
  'cable-front-raise': {
    description: 'Front raise on a low cable for smooth, constant tension.',
    instructions: [
      'Face away from a low pulley with the handle in one hand.',
      'Raise the arm straight forward to shoulder height.',
      'Control the descent.',
      'Finish the set and switch arms.',
    ],
    tips: ['Keep a soft elbow throughout.', 'Stand tall; avoid leaning forward.'],
  },
  'machine-front-raise': {
    description: 'Guided front raise isolating the front delts.',
    instructions: [
      'Set up per the machine’s pad or handle position.',
      'Raise to shoulder height.',
      'Pause briefly at the top.',
      'Lower under control.',
    ],
    tips: ['Strict tempo; the machine removes excuses.', 'Stop at shoulder height; higher adds nothing.'],
  },
  'upright-row': {
    description: 'Vertical pull to the chest for side delts and traps.',
    instructions: [
      'Hold a bar or dumbbells in front of your thighs.',
      'Pull straight up along your body to mid-chest height.',
      'Keep the elbows above the wrists.',
      'Lower with control.',
    ],
    tips: ['A wider grip is friendlier to the shoulders.', 'Stop lower if you feel any pinching.'],
  },
  'rear-delt-fly': {
    description: 'Bent-over or machine reverse fly for the rear delts.',
    instructions: [
      'Hinge forward with dumbbells hanging, or use the pec deck in reverse.',
      'With soft elbows, sweep the arms out to the sides.',
      'Squeeze the rear delts at the top.',
      'Lower with control.',
    ],
    tips: ['Keep the traps quiet; do not pinch the shoulder blades hard.', 'Light weight, high reps works well.'],
  },
  'cable-rear-delt-fly': {
    description: 'Cross-body cable fly hitting the rear delts with constant tension.',
    instructions: [
      'Set two pulleys at shoulder height and grab each handle with the opposite hand.',
      'Pull the arms apart and back in a wide arc.',
      'Finish with arms out to the sides.',
      'Return with control, letting the cables cross.',
    ],
    tips: ['Lead with the pinkies and keep elbows soft.', 'Stay square; do not lean back.'],
  },
  'face-pull': {
    description: 'High cable pull to the face for rear delts and shoulder health.',
    instructions: [
      'Set a rope attachment at face height.',
      'Pull the rope toward your face, splitting the ends beside your ears.',
      'Finish with upper arms level and thumbs pointing back.',
      'Return with control.',
    ],
    tips: ['Think of doing a double bicep pose at the finish.', 'Keep it light and smooth; this is health work.'],
  },

  // Biceps
  'barbell-curl': {
    description: 'The heavy straight-bar curl for overall bicep mass.',
    instructions: [
      'Stand holding the bar at shoulder width, arms long.',
      'Curl the bar up without swinging the torso.',
      'Squeeze at the top.',
      'Lower with control to full extension.',
    ],
    tips: ['Pin the elbows to your sides.', 'If the straight bar hurts your wrists, use the EZ bar.'],
  },
  'bicep-curl': {
    description: 'Classic dumbbell curl with a full supinated squeeze.',
    instructions: [
      'Stand with dumbbells at your sides, palms forward or turning as you lift.',
      'Curl both dumbbells to shoulder height.',
      'Squeeze hard at the top.',
      'Lower slowly to full extension.',
    ],
    tips: ['Control the negative; do not drop the weight.', 'Alternate arms if your form breaks down.'],
  },
  'ez-bar-curl': {
    description: 'Curl with the angled EZ bar, easier on the wrists than a straight bar.',
    instructions: [
      'Grip the angled sections of the bar at shoulder width.',
      'Curl up with elbows pinned to your sides.',
      'Squeeze at the top.',
      'Lower with control.',
    ],
    tips: ['The semi-supinated grip splits work with the forearms.', 'Do not lean back to finish reps.'],
  },
  'hammer-curl': {
    description: 'Neutral-grip curl building the biceps and the brachialis for arm thickness.',
    instructions: [
      'Hold dumbbells with palms facing each other.',
      'Curl up keeping the neutral grip throughout.',
      'Squeeze at the top.',
      'Lower with control.',
    ],
    tips: ['Can usually go heavier than supinated curls.', 'Cross-body hammers hit the brachialis even harder.'],
  },
  'preacher-curl': {
    description: 'Curl braced on the preacher pad, eliminating cheating and stretching the lower bicep.',
    instructions: [
      'Set your armpits at the top of the pad, arms flat against it.',
      'Curl the weight up without lifting the elbows.',
      'Squeeze at the top.',
      'Lower slowly to a near-full stretch.',
    ],
    tips: ['Be careful at the bottom; do not bounce the stretch.', 'The pad exposes weak points; expect to go lighter.'],
  },
  'unilateral-preacher-curl': {
    description: 'One-arm preacher curl for focused, strict bicep work.',
    instructions: [
      'Brace one arm on the preacher pad with a dumbbell.',
      'Curl up while keeping the upper arm glued to the pad.',
      'Squeeze at the top.',
      'Lower slowly to a deep stretch.',
    ],
    tips: ['Support yourself with the free hand.', 'Match reps across arms to keep balance.'],
  },
  'machine-preacher-curl': {
    description: 'Machine curl with fixed path and constant tension on the biceps.',
    instructions: [
      'Set the seat so your armpits sit at the top of the pad.',
      'Curl the handles up.',
      'Squeeze at the top.',
      'Lower with control to a full stretch.',
    ],
    tips: ['Great for drop sets and slow negatives.', 'Do not let the stack touch down between reps.'],
  },
  'cable-curl': {
    description: 'Curl on a low cable with tension through the entire range.',
    instructions: [
      'Stand facing a low pulley with a bar or rope attachment.',
      'Curl to shoulder height with elbows pinned.',
      'Squeeze at the top.',
      'Lower with control.',
    ],
    tips: ['Step back slightly to keep tension at the bottom.', 'Strict torso; no rocking.'],
  },
  'concentration-curl': {
    description: 'Seated single-arm curl braced against the thigh for a peak contraction.',
    instructions: [
      'Sit with your elbow braced against your inner thigh.',
      'Curl the dumbbell toward your shoulder.',
      'Squeeze hard at the top.',
      'Lower slowly to full extension.',
    ],
    tips: ['Keep the shoulder relaxed and let the bicep do everything.', 'Rotate the pinky in slightly at the top.'],
  },
  'spider-curl': {
    description: 'Curl hanging vertically off an incline bench, loading the shortened bicep.',
    instructions: [
      'Lie chest-down on an incline bench with arms hanging straight down.',
      'Curl the weight up as far as possible.',
      'Squeeze hard at the top.',
      'Lower with control to a dead hang.',
    ],
    tips: ['No momentum is possible here; expect humbling weights.', 'Keep the upper arms vertical throughout.'],
  },
  'incline-curl': {
    description: 'Curl lying back on an incline bench for a deep bicep stretch.',
    instructions: [
      'Set the bench around 45 to 60 degrees and lie back with dumbbells hanging.',
      'Curl up while keeping the elbows behind your torso.',
      'Squeeze at the top.',
      'Lower slowly into the stretch.',
    ],
    tips: ['The stretch position is where this shines; control it.', 'Do not let the elbows drift forward.'],
  },
  'drag-curl': {
    description: 'Curl where the bar drags up the torso, elbows traveling back.',
    instructions: [
      'Hold a bar against your thighs.',
      'Curl by dragging the bar up your body, elbows moving back.',
      'Finish with the bar at your lower chest.',
      'Lower along the same path.',
    ],
    tips: ['The bar stays in contact with the torso the whole way.', 'Removes front delt help; expect lighter weight.'],
  },
  'reverse-curl': {
    description: 'Overhand curl building the forearms and brachialis.',
    instructions: [
      'Hold a bar or dumbbells with palms facing down.',
      'Curl up with wrists straight.',
      'Squeeze at the top.',
      'Lower with control.',
    ],
    tips: ['Keep the wrists locked; do not let them bend back.', 'Go noticeably lighter than regular curls.'],
  },
  'bayesian-curl': {
    description: 'Cable curl facing away from the pulley, keeping the bicep loaded in its stretched range.',
    instructions: [
      'Stand facing away from a low pulley, handle in hand, arm slightly behind you.',
      'Curl the handle forward and up.',
      'Squeeze at the top.',
      'Return slowly, letting the arm travel back into the stretch.',
    ],
    tips: ['Stagger your stance for balance.', 'The stretch under load is the point; do not cut it short.'],
  },
  'recline-curl': {
    description: 'Curl performed reclined with arms hanging, isolating the stretched bicep.',
    instructions: [
      'Recline on a low-incline bench with dumbbells hanging straight down.',
      'Curl up without moving the upper arms.',
      'Squeeze at the top.',
      'Lower slowly to full extension.',
    ],
    tips: ['Keep the shoulders pinned back.', 'Strict and slow beats heavy here.'],
  },
  'behind-the-back-curl': {
    description: 'Single-arm cable curl starting behind the body for maximum bicep stretch.',
    instructions: [
      'Stand ahead of a low pulley so the cable pulls your arm slightly behind you.',
      'Curl the handle up and forward.',
      'Squeeze at shoulder height.',
      'Lower slowly back into the stretched start.',
    ],
    tips: ['Stay tall; resist twisting toward the stack.', 'Small weights feel big in this position.'],
  },

  // Triceps
  'tricep-pushdown': {
    description: 'Cable pushdown, the staple tricep isolation.',
    instructions: [
      'Face a high pulley with a bar or rope, elbows pinned to your sides.',
      'Push the attachment down to full arm extension.',
      'Squeeze the triceps at the bottom.',
      'Return with control to about 90 degrees.',
    ],
    tips: ['If the elbows drift forward, the lats are cheating.', 'With a rope, split the ends at the bottom.'],
  },
  'unilateral-tricep-pushdown': {
    description: 'One-arm pushdown to fix side-to-side tricep imbalances.',
    instructions: [
      'Hold a single handle with the elbow pinned to your side.',
      'Push down to full extension.',
      'Squeeze at the bottom.',
      'Return with control.',
    ],
    tips: ['An underhand grip variation hits the medial head nicely.', 'Keep the shoulder quiet.'],
  },
  'overhead-tricep-extension': {
    description: 'Overhead extension loading the long head of the triceps in its stretched range.',
    instructions: [
      'Hold a dumbbell or rope overhead with both hands.',
      'Lower behind your head by bending the elbows.',
      'Feel a deep tricep stretch.',
      'Extend back to full lockout.',
    ],
    tips: ['Keep the elbows narrow; they will want to flare.', 'The long head only stretches fully overhead; that is the point.'],
  },
  'unilateral-overhead-tricep-extension': {
    description: 'Single-arm overhead extension for a focused long-head stretch.',
    instructions: [
      'Press one dumbbell overhead.',
      'Lower it behind your head by bending the elbow.',
      'Keep the upper arm vertical.',
      'Extend back to lockout.',
    ],
    tips: ['Support the working elbow with your free hand if needed.', 'Go light; the stretch is intense.'],
  },
  'skull-crusher': {
    description: 'Lying tricep extension lowering the bar to the forehead.',
    instructions: [
      'Lie flat holding an EZ bar over your chest.',
      'Bend at the elbows to lower the bar toward your forehead or just behind it.',
      'Keep the upper arms still.',
      'Extend back to full lockout.',
    ],
    tips: ['Lowering slightly behind the head is easier on the elbows.', 'Do not turn it into a press when tired.'],
  },
  'tricep-kickback': {
    description: 'Bent-over extension squeezing the tricep at full contraction.',
    instructions: [
      'Hinge forward with your upper arm parallel to the floor.',
      'Extend the forearm back until the arm is straight.',
      'Squeeze at full extension.',
      'Return with control to 90 degrees.',
    ],
    tips: ['The upper arm must stay frozen in place.', 'Light weight done strictly is the whole game.'],
  },
  'jm-press': {
    description: 'Hybrid of a close-grip press and skull crusher for heavy tricep loading.',
    instructions: [
      'Lie flat holding a bar with a shoulder-width grip over your upper chest.',
      'Lower toward your chin by letting the elbows drop down and slightly forward.',
      'Stop a few inches above your chin or neck.',
      'Press back up to lockout.',
    ],
    tips: ['Learn it light; the groove takes practice.', 'Keep the elbows tucked in front of the bar.'],
  },
  'close-grip-bench-press': {
    description: 'Bench press with a narrow grip shifting the load to the triceps.',
    instructions: [
      'Grip the bar at about shoulder width.',
      'Lower to your lower chest with elbows tucked close.',
      'Keep the wrists stacked over the elbows.',
      'Press back up to lockout.',
    ],
    tips: ['Do not grip so narrow that the wrists hurt.', 'Expect to handle less than your regular bench.'],
  },
  'machine-tricep-extension': {
    description: 'Machine extension isolating the triceps with a fixed path.',
    instructions: [
      'Set the seat so your elbows line up with the machine pivot.',
      'Extend the arms to full lockout.',
      'Squeeze at the end.',
      'Return with control.',
    ],
    tips: ['Adjust the pivot alignment before loading up.', 'Slow negatives work great here.'],
  },
  'underhand-cable-extension': {
    description: 'Reverse-grip pushdown biasing the medial head of the triceps.',
    instructions: [
      'Grip a straight bar underhand at a high pulley.',
      'Push down to full extension with elbows pinned.',
      'Squeeze at the bottom.',
      'Return with control.',
    ],
    tips: ['Keep a firm wrist; the grip is the limiter.', 'Lighter than a standard pushdown is normal.'],
  },
  'machine-tricep-dip': {
    description: 'Machine dip pressing down on handles for triceps and lower chest.',
    instructions: [
      'Sit tall and grip the handles beside your torso.',
      'Press down to full arm extension.',
      'Squeeze the triceps at lockout.',
      'Return with control until the elbows reach about 90 degrees.',
    ],
    tips: ['Stay upright to keep it tricep-focused.', 'Do not let the shoulders shrug up.'],
  },
  // Quads
  squat: {
    description: 'The barbell back squat, the foundational lower-body strength lift.',
    instructions: [
      'Set the bar on your upper traps and stand with feet shoulder width.',
      'Brace your core and sit down between your hips.',
      'Reach at least parallel with knees tracking over the toes.',
      'Drive up through the whole foot to stand.',
    ],
    tips: ['Keep the chest tall; do not fold forward.', 'Depth with good position beats extra plates.'],
  },
  'front-squat': {
    description: 'Squat with the bar racked on the front delts, keeping the torso upright and quads loaded.',
    instructions: [
      'Rack the bar on your front delts with elbows high.',
      'Squat down keeping the torso vertical.',
      'Sit as deep as your mobility allows.',
      'Drive up while keeping the elbows lifted.',
    ],
    tips: ['If the clean grip is tough, cross your arms.', 'The elbows dropping means the rep is dying; keep them up.'],
  },
  'box-squat': {
    description: 'Squat to a box that grooves depth and builds explosive hip drive.',
    instructions: [
      'Set a box at parallel height behind you.',
      'Squat back until you sit fully but softly on the box.',
      'Pause without relaxing.',
      'Drive up explosively.',
    ],
    tips: ['Sit back more than down; shins stay vertical.', 'Do not rock or bounce off the box.'],
  },
  'overhead-squat': {
    description: 'Squat holding the bar locked out overhead; a full-body mobility and stability test.',
    instructions: [
      'Press or snatch the bar overhead with a wide grip.',
      'Keep the bar over your mid-foot as you squat down.',
      'Stay as upright as possible.',
      'Stand while keeping the bar locked out.',
    ],
    tips: ['Master a deep pause squat first.', 'Start with an empty bar or even a stick.'],
  },
  'smith-machine-squat': {
    description: 'Fixed-path squat allowing unusual foot positions and safe solo training.',
    instructions: [
      'Set the bar on your upper traps and place your feet slightly ahead of the bar line.',
      'Unrack by rotating the bar.',
      'Squat to parallel or below.',
      'Drive up and re-hook when finished.',
    ],
    tips: ['Feet forward makes it quad-friendly without balance demands.', 'Set the safety stops before starting.'],
  },
  'goblet-squat': {
    description: 'Squat holding one dumbbell at the chest; the best squat teacher.',
    instructions: [
      'Hold a dumbbell vertically against your chest.',
      'Squat down between your knees, elbows tracking inside them.',
      'Reach full depth with a tall chest.',
      'Drive up through the whole foot.',
    ],
    tips: ['The counterweight lets almost anyone squat deep.', 'When the dumbbells get silly heavy, move to a barbell.'],
  },
  'bulgarian-split-squat': {
    description: 'Rear-foot-elevated split squat, brutally effective for quads and glutes.',
    instructions: [
      'Place your rear foot on a bench behind you.',
      'Lower straight down until the rear knee nears the floor.',
      'Keep the front shin fairly vertical.',
      'Drive up through the front foot.',
    ],
    tips: ['A longer stance hits glutes; shorter hits quads.', 'Hold dumbbells at your sides to load it.'],
  },
  'split-squat': {
    description: 'Static lunge position squat for single-leg strength and balance.',
    instructions: [
      'Take a long stride and keep both feet planted.',
      'Lower the rear knee toward the floor.',
      'Keep the torso tall.',
      'Drive up without stepping.',
    ],
    tips: ['Think down, not forward.', 'Progress to Bulgarian split squats when easy.'],
  },
  'sissy-squat': {
    description: 'Knees-forward squat that isolates the quads through a deep stretch.',
    instructions: [
      'Stand tall, holding support if needed.',
      'Rise onto your toes and drive the knees forward while leaning the torso back.',
      'Lower as deep as your knees allow, body in one line from knees to head.',
      'Squeeze the quads to return.',
    ],
    tips: ['Build up slowly; the knee stretch is intense.', 'Hold a plate against your chest to progress.'],
  },
  'pistol-squat': {
    description: 'Full single-leg squat demanding strength, balance, and mobility.',
    instructions: [
      'Stand on one leg with the other extended forward.',
      'Squat all the way down on the standing leg.',
      'Keep the heel down and arms forward for balance.',
      'Drive up without touching the free leg down.',
    ],
    tips: ['Hold a light counterweight in front to learn it.', 'Squat to a box first and lower the box over time.'],
  },
  'hack-squat': {
    description: 'Machine squat on an angled sled, isolating the quads safely.',
    instructions: [
      'Set your shoulders under the pads, feet low-ish on the platform.',
      'Release the handles and lower to a deep knee bend.',
      'Keep your back flat on the pad.',
      'Drive up through the whole foot.',
    ],
    tips: ['Lower foot placement means more quads.', 'Do not bounce out of the bottom.'],
  },
  'landmine-squat': {
    description: 'Squat holding the end of a landmine bar; self-balancing and beginner friendly.',
    instructions: [
      'Hold the bar end at your chest with both hands.',
      'Squat down as the bar arcs with you.',
      'Keep the chest tall.',
      'Drive up to standing.',
    ],
    tips: ['The arc naturally keeps you balanced.', 'Great teaching tool for squat depth.'],
  },
  'leg-press': {
    description: 'Sled press for heavy quad and glute work without spinal loading.',
    instructions: [
      'Sit with feet shoulder width on the platform.',
      'Release the safeties and lower the sled with control.',
      'Stop before the lower back rolls off the pad.',
      'Press up without slamming into lockout.',
    ],
    tips: ['Never fully lock the knees hard.', 'Feet lower on the platform hits quads; higher hits glutes and hams.'],
  },
  'leg-extension': {
    description: 'Machine isolation for the quads.',
    instructions: [
      'Set the pad on your shins just above the ankles, knees aligned with the pivot.',
      'Extend the legs to full lockout.',
      'Squeeze the quads at the top.',
      'Lower with control.',
    ],
    tips: ['Pause at the top; the squeeze is the exercise.', 'The seat should hold your thighs fully supported.'],
  },

  // Hamstrings & Glutes
  'romanian-deadlift': {
    description: 'Hip hinge with the barbell for hamstrings and glutes through a loaded stretch.',
    instructions: [
      'Stand holding the bar at your thighs.',
      'Push the hips back, letting the bar slide down your legs.',
      'Keep a flat back and soft knees until you feel a deep hamstring stretch.',
      'Drive the hips forward to stand.',
    ],
    tips: ['The bar stays against your legs the entire time.', 'Range is set by your hamstrings, not the floor.'],
  },
  'single-leg-romanian-deadlift': {
    description: 'One-leg hinge for hamstrings, glutes, and balance.',
    instructions: [
      'Stand on one leg with a dumbbell in the opposite hand.',
      'Hinge forward as the free leg extends behind you.',
      'Keep the hips square and back flat.',
      'Return to standing by driving the hips forward.',
    ],
    tips: ['Move slowly; balance is half the work.', 'Square hips beat extra depth.'],
  },
  'dumbbell-romanian-deadlift': {
    description: 'RDL with dumbbells for a longer range and easier setup.',
    instructions: [
      'Hold dumbbells in front of your thighs.',
      'Push the hips back with a flat back.',
      'Lower until the hamstrings pull hard.',
      'Stand by driving the hips through.',
    ],
    tips: ['Keep the dumbbells close to your legs.', 'Do not turn it into a squat; knees stay soft.'],
  },
  deadlift: {
    description: 'The conventional barbell deadlift, the king of posterior-chain strength.',
    instructions: [
      'Stand with the bar over mid-foot, feet hip width.',
      'Hinge and grip just outside your legs.',
      'Brace, flatten your back, and push the floor away.',
      'Stand tall, then return the bar with control.',
    ],
    tips: ['Take slack out of the bar before pulling.', 'Keep the bar dragging up your shins and thighs.'],
  },
  'sumo-deadlift': {
    description: 'Wide-stance deadlift emphasizing glutes and quads with a shorter pull.',
    instructions: [
      'Take a wide stance with toes pointed out.',
      'Grip the bar inside your legs.',
      'Drive the knees out and push the floor apart as you stand.',
      'Lock out with glutes, then lower with control.',
    ],
    tips: ['Get the hips close to the bar at the start.', 'Patience off the floor; sumo starts slow.'],
  },
  'hex-bar-deadlift': {
    description: 'Deadlift inside a hex bar; more upright, knee-friendly, and beginner friendly.',
    instructions: [
      'Stand centered inside the bar.',
      'Hinge down and grip the handles.',
      'Brace and stand by driving through the whole foot.',
      'Lower with control.',
    ],
    tips: ['Great first deadlift variation.', 'High handles reduce the range if mobility is limited.'],
  },
  'dumbbell-deadlift': {
    description: 'Deadlift pattern with dumbbells, ideal for learning the hinge.',
    instructions: [
      'Stand with dumbbells at your sides.',
      'Hinge down with a flat back until the weights reach mid-shin.',
      'Drive through the floor to stand.',
      'Keep the weights close to your body.',
    ],
    tips: ['Perfect for home and beginner training.', 'Think hips back, not knees forward.'],
  },
  'stiff-leg-deadlift': {
    description: 'Deadlift with nearly straight knees for maximum hamstring stretch.',
    instructions: [
      'Hold the bar with knees almost straight.',
      'Hinge at the hips with a flat back.',
      'Lower until the hamstrings reach their limit.',
      'Drive the hips forward to stand.',
    ],
    tips: ['Slightly different from an RDL: knees stay stiffer, stretch is bigger.', 'Round nothing; the back stays set.'],
  },
  'leg-curl': {
    description: 'Seated machine curl, the hamstring isolation staple.',
    instructions: [
      'Sit with the pad on your lower calves and knees at the pivot.',
      'Curl the legs down and under as far as possible.',
      'Squeeze the hamstrings at the bottom.',
      'Return with control to a full stretch.',
    ],
    tips: ['The seated version stretches the hamstrings more than lying; use the range.', 'Do not let the weight yank your legs back up.'],
  },
  'lying-leg-curl': {
    description: 'Face-down machine curl for the hamstrings.',
    instructions: [
      'Lie face down with the pad on your lower calves.',
      'Curl your heels toward your glutes.',
      'Squeeze at the top.',
      'Lower with control to full extension.',
    ],
    tips: ['Keep the hips pressed into the bench.', 'Point the toes to make the hamstrings work alone.'],
  },
  'standing-leg-curl': {
    description: 'One-leg standing curl isolating each hamstring in turn.',
    instructions: [
      'Set the pad at your lower calf and stand tall.',
      'Curl the heel toward your glute.',
      'Squeeze at the top.',
      'Lower with control.',
    ],
    tips: ['Keep the working thigh vertical.', 'Do not lean forward as you curl.'],
  },
  'hip-thrust': {
    description: 'Barbell bridge off a bench, the heaviest direct glute exercise.',
    instructions: [
      'Sit with your upper back on a bench, bar over your hips.',
      'Plant your feet so shins are vertical at the top.',
      'Drive the hips up to a straight line from knees to shoulders.',
      'Squeeze the glutes hard, then lower with control.',
    ],
    tips: ['Tuck the chin and look forward at the top.', 'Use a pad on the bar; your hips will thank you.'],
  },
  'glute-bridge': {
    description: 'Floor bridge for glutes; the hip thrust’s simpler sibling.',
    instructions: [
      'Lie on your back with knees bent and feet flat.',
      'Drive the hips up until your body is straight from knees to shoulders.',
      'Squeeze the glutes at the top for a second.',
      'Lower with control.',
    ],
    tips: ['Push through the heels.', 'Add a dumbbell on the hips to progress.'],
  },
  'glute-kickback': {
    description: 'Cable or bodyweight kickback isolating one glute at a time.',
    instructions: [
      'Attach an ankle cuff to a low cable and face the machine.',
      'Kick the leg straight back with a squeeze.',
      'Keep the torso still and core braced.',
      'Return with control.',
    ],
    tips: ['Squeeze at the top instead of swinging higher.', 'Do not arch the lower back to fake range.'],
  },
  'pull-through': {
    description: 'Cable hinge pulled between the legs, teaching the hip drive with constant tension.',
    instructions: [
      'Face away from a low pulley with the rope between your legs.',
      'Hinge forward letting the cable pull your hips back.',
      'Feel the hamstring stretch.',
      'Snap the hips forward and squeeze the glutes.',
    ],
    tips: ['Arms are hooks; the hips do everything.', 'Great warm-up before deadlifts.'],
  },
  'glute-ham-raise': {
    description: 'Bodyweight hamstring curl on the GHD, brutally effective.',
    instructions: [
      'Lock your feet in the GHD with knees on the pad.',
      'Lower your torso forward with control, resisting with the hamstrings.',
      'Keep the hips extended.',
      'Curl yourself back up to vertical.',
    ],
    tips: ['Push off with the hands to assist while learning.', 'Do not hinge at the hips; the body stays straight.'],
  },
  'good-morning': {
    description: 'Barbell hinge with the bar on the back, loading hamstrings and spinal erectors.',
    instructions: [
      'Set the bar on your upper traps.',
      'Push the hips back with soft knees.',
      'Lower the torso until you feel the hamstrings load.',
      'Drive the hips forward to stand.',
    ],
    tips: ['Start light; the leverage is unforgiving.', 'Brace like a squat before every rep.'],
  },
  'machine-hip-abduction': {
    description: 'Machine that opens the legs against resistance for glute medius.',
    instructions: [
      'Sit with the pads outside your knees.',
      'Press the legs apart as far as possible.',
      'Pause at the widest point.',
      'Return with control.',
    ],
    tips: ['Lean slightly forward to bias the upper glutes.', 'Pause at the end range; do not bounce.'],
  },
  'machine-hip-adduction': {
    description: 'Machine that squeezes the legs together for the inner thighs.',
    instructions: [
      'Sit with the pads inside your knees.',
      'Squeeze the legs together.',
      'Pause at the middle.',
      'Return with control to a comfortable stretch.',
    ],
    tips: ['Set the start width conservatively.', 'Smooth reps; the adductors dislike jerky loading.'],
  },
  'walking-lunge': {
    description: 'Alternating forward lunges covering ground, for quads, glutes, and conditioning.',
    instructions: [
      'Step forward into a lunge, rear knee toward the floor.',
      'Drive through the front foot to step into the next lunge.',
      'Keep the torso tall throughout.',
      'Alternate legs each step.',
    ],
    tips: ['Longer steps hit glutes; shorter steps hit quads.', 'Hold dumbbells at your sides to load it.'],
  },
  'reverse-lunge': {
    description: 'Lunge stepping backward; knee-friendly and glute-biased.',
    instructions: [
      'Step one foot back and lower the rear knee toward the floor.',
      'Keep the front shin vertical.',
      'Drive through the front foot to return.',
      'Alternate sides or finish one leg first.',
    ],
    tips: ['Easier on the knees than forward lunges.', 'Keep the weight in the front heel.'],
  },
  'dumbbell-lunge': {
    description: 'Lunges holding dumbbells for loaded single-leg work.',
    instructions: [
      'Hold dumbbells at your sides.',
      'Step forward or backward into a lunge.',
      'Lower the rear knee toward the floor.',
      'Drive back to standing.',
    ],
    tips: ['Grip is often the limit; use straps if needed.', 'Control the descent; do not drop into the bottom.'],
  },
  'step-up': {
    description: 'Step onto a box driving through one leg, for quads and glutes.',
    instructions: [
      'Place one whole foot on a knee-high box.',
      'Drive through that foot to stand on the box.',
      'Avoid pushing off the floor leg.',
      'Lower with control and repeat.',
    ],
    tips: ['The floor leg is along for the ride; make the top leg work.', 'Higher box means more glutes.'],
  },

  // Calves
  'calf-raise': {
    description: 'Standing raise for the gastrocnemius, the big calf muscle.',
    instructions: [
      'Stand with the balls of your feet on an edge, heels hanging.',
      'Lower into a deep stretch.',
      'Pause briefly at the bottom.',
      'Drive up as high as possible and squeeze.',
    ],
    tips: ['The pause at the stretch removes the bounce that steals results.', 'Straight knees put the work in the upper calf.'],
  },
  'seated-calf-raise': {
    description: 'Seated raise targeting the soleus under the bent knee.',
    instructions: [
      'Sit with the pads on your knees, balls of feet on the platform.',
      'Lower the heels to a deep stretch.',
      'Pause at the bottom.',
      'Press up to full extension and squeeze.',
    ],
    tips: ['Bent knees shift the work to the soleus; both matter.', 'Full range beats heavy half reps.'],
  },
  'donkey-calf-raise': {
    description: 'Bent-over calf raise with a big stretch, on a machine or with weight on the hips.',
    instructions: [
      'Hinge forward with the balls of your feet on a ledge.',
      'Lower the heels to a maximum stretch.',
      'Pause briefly.',
      'Drive up to a full squeeze.',
    ],
    tips: ['The hip hinge stretches the calves harder than standing.', 'Slow negatives pay off here.'],
  },
  'leg-press-calf-raise': {
    description: 'Calf press on the leg press sled for heavy, stable loading.',
    instructions: [
      'Place the balls of your feet at the bottom of the platform.',
      'Press the sled with your calves to full extension.',
      'Lower with control to a deep stretch.',
      'Keep the knees nearly straight throughout.',
    ],
    tips: ['Never release the safeties for this one.', 'Do not let the weight bounce the stretch.'],
  },

  // Core
  'cable-crunch': {
    description: 'Kneeling weighted crunch on a rope, the loadable ab builder.',
    instructions: [
      'Kneel below a high pulley holding the rope beside your head.',
      'Crunch down by flexing the spine, elbows toward the thighs.',
      'Squeeze the abs hard at the bottom.',
      'Return with control to a tall kneel.',
    ],
    tips: ['The hips stay still; only the spine flexes.', 'Add weight over time like any other lift.'],
  },
  'machine-crunch': {
    description: 'Seated crunch machine for progressive ab loading.',
    instructions: [
      'Set the pads at your chest and grab the handles.',
      'Crunch forward by flexing the spine.',
      'Squeeze at the bottom.',
      'Return with control without letting the stack rest.',
    ],
    tips: ['Exhale hard as you crunch.', 'Pick a weight that allows a hard squeeze, not a heave.'],
  },
  'sit-up': {
    description: 'The classic full sit up for the abs and hip flexors.',
    instructions: [
      'Lie with knees bent, feet anchored or free.',
      'Curl your torso up until your chest nears your knees.',
      'Lower with control one vertebra at a time.',
      'Keep the neck relaxed.',
    ],
    tips: ['Do not yank the head with your hands.', 'Slow negatives make easy reps hard.'],
  },
  'decline-sit-up': {
    description: 'Sit up on a decline bench with a longer, harder range.',
    instructions: [
      'Hook your feet in the decline bench pads.',
      'Curl up to your knees.',
      'Lower with control until your back reaches the bench.',
      'Repeat without bouncing.',
    ],
    tips: ['Hold a plate at your chest to progress.', 'Steeper decline means harder reps.'],
  },
  plank: {
    description: 'Isometric hold in a straight line, the core stability baseline.',
    instructions: [
      'Set your forearms under your shoulders, body in a straight line.',
      'Squeeze the glutes and brace the abs.',
      'Hold without letting the hips sag or pike.',
      'Breathe steadily.',
    ],
    tips: ['A hard 30 second squeeze beats a saggy 3 minutes.', 'Tuck the pelvis slightly to feel the abs.'],
  },
  'side-plank': {
    description: 'Sideways plank for the obliques and lateral core.',
    instructions: [
      'Lie on your side with the forearm under your shoulder.',
      'Lift the hips to form a straight line.',
      'Hold while breathing steadily.',
      'Switch sides.',
    ],
    tips: ['Stack or stagger your feet, whichever balances better.', 'Do not let the hips drift back.'],
  },
  'hanging-leg-raise': {
    description: 'Hanging raise for the lower abs and grip.',
    instructions: [
      'Hang from a bar with straight arms.',
      'Raise your legs to at least hip height, higher if possible.',
      'Curl the pelvis up at the top.',
      'Lower with control without swinging.',
    ],
    tips: ['Bend the knees to make it easier.', 'The pelvis curl at the top is what makes the abs work.'],
  },
  'ab-wheel': {
    description: 'Rollout from the knees, the anti-extension core builder.',
    instructions: [
      'Kneel with the wheel under your shoulders.',
      'Roll forward with a braced core and tucked pelvis.',
      'Go as far as you can without the lower back arching.',
      'Pull back to the start using your abs.',
    ],
    tips: ['Range grows with strength; do not force it.', 'If your back arches, stop shorter.'],
  },
  'russian-twist': {
    description: 'Seated rotation for the obliques.',
    instructions: [
      'Sit leaned back with knees bent, heels lightly down or lifted.',
      'Hold a weight at your chest.',
      'Rotate the torso side to side with control.',
      'Let the shoulders turn, not just the arms.',
    ],
    tips: ['Slow, full turns beat fast taps.', 'Lift the feet to increase the challenge.'],
  },
}
