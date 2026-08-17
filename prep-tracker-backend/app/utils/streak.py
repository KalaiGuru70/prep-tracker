from datetime import date, timedelta


def calculate_streaks(entry_dates: list[str]):
    """
    entry_dates: list of date strings like ["2026-08-09", "2026-08-10", "2026-08-11"]
    Returns: (current_streak, longest_streak)
    """
    if not entry_dates:
        return 0, 0


    # Convert strings to actual date objects, remove duplicates, sort ascending
    dates = sorted(set(date.fromisoformat(d) for d in entry_dates))

    # ---- Longest streak: scan through sorted dates, count consecutive runs ----
    longest = 1
    current_run = 1
    for i in range(1, len(dates)):
        if dates[i] == dates[i - 1] + timedelta(days=1):
            current_run += 1
        else:
            current_run = 1
        longest = max(longest, current_run)

    # ---- Current streak: walk backward from today ----
    today = date.today()
    date_set = set(dates)
    current_streak = 0

    # If today isn't logged yet, streak can still be "alive" if yesterday was logged
    check_day = today if today in date_set else today - timedelta(days=1)

    while check_day in date_set:
        current_streak += 1
        check_day -= timedelta(days=1)

    return current_streak, longest