import React from "react";
import { Layout, Button } from "antd";

const { Footer: AntFooter } = Layout;

interface FooterProps {
  onAiSummary: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAiSummary }) => {
  return (
    <AntFooter>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button type="primary" onClick={onAiSummary}>
          今日AI总结
        </Button>
      </div>
    </AntFooter>
  );
};

export default Footer;
