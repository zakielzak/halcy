interface ImagePlaceholderProps {
    index: number;
    width: number;
    heigth: number;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ index, width, heigth }) => {
    
    const style = {
      width: `${width}px`,
      height: `${heigth}px`,
      backgroundColor: "#3498db",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      color: "#888",
      border: "1px solid #ccc",
      borderRadius: "5px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    };

    return (
        <div style={style}>
            Item {index} - {width}x{heigth}
        </div>
    )
}

export default ImagePlaceholder