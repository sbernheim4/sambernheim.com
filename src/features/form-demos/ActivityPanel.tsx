type ActivityItem = {
  id: number;
  text: string;
};

export function ActivityPanel({ activity }: { activity: ActivityItem[] }) {
  return (
    <section className="state-panel">
      <div className="panel-heading">
        <h2>After Effects</h2>
        <span>{activity.length}</span>
      </div>
      {activity.length === 0 ? (
        <p className="empty-copy">No saves yet.</p>
      ) : (
        <ul className="activity-list">
          {activity.map((item) => (
            <li key={item.id}>{item.text}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function createActivity(text: string): ActivityItem {
  return {
    id: Date.now() + Math.random(),
    text,
  };
}
