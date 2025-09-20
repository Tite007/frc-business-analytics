# 🔧 AGENT QUICK REFERENCE - FRC Business Analytics

## 🚨 BEFORE YOU START - READ THIS

**System Status**: ✅ FULLY FUNCTIONAL  
**Last Updated**: August 30, 2025  
**Critical Documentation**: See `CURRENT_SYSTEM_STATE_DOCUMENTATION.md`

---

## ⚡ QUICK HEALTH CHECK

Run these commands to verify system is working:

```bash
cd /Users/fundamentalresearch/Documents/Web\ Develop\ Projects/frc-business-analytics
npm run build     # MUST pass
npm run dev       # MUST start without errors
```

Navigate to: `http://localhost:3000/cms/content/create-professional`

**What Should Work:**

- ✅ Page loads with block editor interface
- ✅ Header block shows FRC logo preview automatically
- ✅ All block types have functional input fields
- ✅ TinyMCE editors load for analysis content
- ✅ Preview shows professional PDF layout
- ✅ FRC logo appears in PDF preview header

---

## 🛠️ KEY FILES & WHAT THEY DO

### **Main Editor**

`src/app/cms/content/create-professional/page.jsx`

- **Purpose**: Block-based report editor interface
- **Critical Parts**: `blockTypes`, `convertBlocksToReportData`, `HeaderBlockEditor`
- **Logo System**: Hardcoded in multiple places - DO NOT REMOVE

### **PDF Layout**

`src/components/PDFReportLayout.jsx`

- **Purpose**: Professional Wall Street-grade PDF formatting
- **Critical Parts**: Institutional header with logo, print styles
- **Logo Location**: Around line 256 in institutional header

### **Logo File**

`public/FRC_Logo_FullWhite.png`

- **Purpose**: FRC branding logo (white version for dark backgrounds)
- **Usage**: Hardcoded in system, automatically included
- **DO NOT**: Move, rename, or delete this file

---

## 🔍 TROUBLESHOOTING

### **Build Fails**

```bash
# Check for syntax errors
npm run build

# Common issues:
# - Missing imports
# - Syntax errors in JSX
# - Missing dependencies
```

### **Logo Not Showing**

1. Verify file exists: `public/FRC_Logo_FullWhite.png`
2. Check hardcoded paths in code
3. Clear browser cache
4. Restart dev server

### **Editor Not Working**

1. Check TinyMCE dependency: `@tinymce/tinymce-react`
2. Verify all block editor components are implemented
3. Check console for JavaScript errors

### **PDF Layout Broken**

1. Verify `PDFReportLayout` component imports correctly
2. Check print styles are intact
3. Test `convertBlocksToReportData` function

---

## 🚀 SAFE DEVELOPMENT PATTERNS

### **Adding New Features**

```javascript
// 1. Add new block type
const newBlockType = {
  id: "my-new-block",
  name: "My New Block",
  template: { /* default data */ }
};

// 2. Create editor component
function MyNewBlockEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      {/* your form inputs */}
    </div>
  );
}

// 3. Add to switch statement in BlockEditor
case "my-new-block":
  return <MyNewBlockEditor block={block} onUpdate={onUpdate} />;
```

### **Modifying Data Flow**

```javascript
// Extend convertBlocksToReportData function
blocks.forEach((block) => {
  switch (block.type) {
    case "my-new-block":
      // Process your new block data
      break;
  }
});
```

---

## ❌ DANGER ZONES - DO NOT TOUCH

### **Logo System**

- Hardcoded paths: `/FRC_Logo_FullWhite.png`
- Auto-enforcement in `HeaderBlockEditor`
- Logo display in `PDFReportLayout`

### **Print Styles**

- CSS in `PDFReportLayout` component
- Page size configurations
- Typography settings

### **Data Conversion**

- `convertBlocksToReportData` function signature
- Block type structure
- Default data templates

---

## 📝 QUICK TESTS BEFORE DEPLOYING

```bash
# 1. Build test
npm run build

# 2. Start dev server
npm run dev

# 3. Manual checks:
# - Load /cms/content/create-professional
# - Create new report
# - Add content to blocks
# - Check PDF preview
# - Verify logo appears
```

---

## 🆘 EMERGENCY RESTORE

If you break something:

```bash
# 1. Check git status
git status

# 2. See recent commits
git log --oneline -5

# 3. Restore to working state
git reset --hard <last-working-commit>

# 4. Reinstall dependencies
npm install

# 5. Test
npm run build && npm run dev
```

---

## 📞 NEED HELP?

1. **Read**: `CURRENT_SYSTEM_STATE_DOCUMENTATION.md` (full details)
2. **Check**: Build output for specific errors
3. **Verify**: All critical files exist and have correct content
4. **Test**: Each component individually

**Remember**: This system is fully functional. If something breaks, it's likely a change that violated the established patterns documented here.

---

**Created**: August 30, 2025  
**System Version**: Stable Working Build  
**Agent Instruction**: Follow documentation exactly - don't assume, don't guess
