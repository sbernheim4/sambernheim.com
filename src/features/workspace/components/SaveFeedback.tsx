export const SaveFeedback = ({ visible }: { visible: boolean }) => {
  if (!visible) {
    return null;
  }
  return (
    <p className="save-feedback" role="status">
      Changes saved.
    </p>
  );
};
