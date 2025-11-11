from collections import Counter
from typing import List, Optional
from datetime import datetime
import numpy as np

def prepare_text_level_analysis(texts: List[str], mh_preds: List[Optional[int]], sent_preds: List[Optional[float]]):
    """
    Prepare detailed analysis per text: returns list of dicts including text, mental health pred, sentiment pred.
    """
    return [
        {
            'text': text,
            'mental_health_pred': mh,
            'sentiment_pred': float(sent) if sent is not None else None
        }
        for text, mh, sent in zip(texts, mh_preds, sent_preds)
    ]

def prepare_date_grouped_analysis(dates: List[datetime], mh_preds: List[Optional[int]], sent_preds: List[Optional[float]]):
    """
    Group predictions by date and return aggregates suitable for plotting time series:
    - Most common mental health label per date
    - Average sentiment score per date
    """
    from collections import defaultdict

    mh_by_date = defaultdict(list)
    sent_by_date = defaultdict(list)

    for d, mh, sent in zip(dates, mh_preds, sent_preds):
        date_str = d.strftime("%Y-%m-%d")
        if mh is not None:
            mh_by_date[date_str].append(mh)
        if sent is not None:
            sent_by_date[date_str].append(sent)

    date_analysis = []
    all_dates = sorted(set(d.strftime("%Y-%m-%d") for d in dates))
    for date_str in all_dates:
        mh_list = mh_by_date.get(date_str, [])
        sent_list = sent_by_date.get(date_str, [])
        if mh_list:
            # mode mental health label
            mh_mode, mh_count = Counter(mh_list).most_common(1)[0]
        else:
            mh_mode, mh_count = None, 0
        sent_avg = np.mean(sent_list) if sent_list else None

        date_analysis.append({
            'date': date_str,
            'mental_health_mode': mh_mode,
            'mental_health_count': mh_count,
            'sentiment_avg': sent_avg
        })

    return date_analysis

def calculate_most_probable_illness(mh_preds: List[Optional[int]], normal_label=5, threshold=0.3):
    """
    Calculate the most probable mental illness class and its probability.
    If below threshold (e.g. 0.3), return 'Normal' as most probable.
    """
    filtered_preds = [p for p in mh_preds if p is not None and p != normal_label]
    if not filtered_preds:
        return 'Normal', 1.0

    count = Counter(filtered_preds)
    mode_class, count_mode = count.most_common(1)[0]
    prob = count_mode / len(mh_preds)

    if prob < threshold:
        return 'Normal', prob
    else:
        return mode_class, prob
