import { styles } from "./styles"

export default function ModeToggle({ mode, setMode}) {
    return (
        <div style={styles.modeRow}>
            <button 
                onClick={() => setMode("fast")} 
                style={{
                    ...styles.modeButton,
                    ...(mode === "fast" ? styles.modeButtonActive : {})
                }}>
                Fast
            </button>
            <button 
                onClick={() => setMode("smart")} 
                style={{
                    ...styles.modeButton,
                    ...(mode === "smart" ? styles.modeButtonActive : {})
                }}>
                Smart
            </button>
        </div>
    )
}