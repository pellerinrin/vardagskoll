Add-Type -AssemblyName System.Drawing

$root = $PSScriptRoot
$accent = [System.Drawing.Color]::FromArgb(255, 0xE8, 0x59, 0x0C)
$accentDark = [System.Drawing.Color]::FromArgb(255, 0xC9, 0x4A, 0x08)
$white = [System.Drawing.Color]::White

function New-Icon {
  param(
    [int]$Size,
    [string]$Path,
    [double]$Padding = 0.0,   # fraction of size reserved as safe-zone padding (for maskable icons)
    [bool]$RoundedBg = $true
  )

  $bmp = [System.Drawing.Bitmap]::new($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::Transparent)

  $pad = [int]($Size * $Padding)
  $rectSize = $Size - (2 * $pad)
  $rect = [System.Drawing.Rectangle]::new($pad, $pad, $rectSize, $rectSize)

  # rounded-rect background with soft gradient
  $radius = [int]($rectSize * 0.24)
  $bgPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $radius * 2
  $bgPath.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $bgPath.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $bgPath.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $bgPath.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $bgPath.CloseFigure()

  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $accent, $accentDark, 45)
  $g.FillPath($brush, $bgPath)

  # white heart glyph, centered, scaled to ~46% of the rect
  $heartScale = $rectSize * 0.5
  $cx = $rect.X + $rectSize / 2.0
  $cy = $rect.Y + $rectSize / 2.0 + ($rectSize * 0.03)

  $hp = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $s = $heartScale / 2.0
  # heart built from two circles + a triangle, using a unit coordinate system scaled by $s
  $lobeR = $s * 0.62
  $lobeCx1 = $cx - $lobeR * 0.72
  $lobeCx2 = $cx + $lobeR * 0.72
  $lobeCy = $cy - $s * 0.28
  $hp.AddEllipse($lobeCx1 - $lobeR, $lobeCy - $lobeR, $lobeR * 2, $lobeR * 2)
  $hp.AddEllipse($lobeCx2 - $lobeR, $lobeCy - $lobeR, $lobeR * 2, $lobeR * 2)

  $pts = @(
    [System.Drawing.PointF]::new(($cx - $s * 1.02), ($cy - $s * 0.12)),
    [System.Drawing.PointF]::new(($cx + $s * 1.02), ($cy - $s * 0.12)),
    [System.Drawing.PointF]::new($cx, ($cy + $s * 1.08))
  )
  $hp.AddPolygon($pts)

  $region1 = [System.Drawing.Region]::new($hp)
  $g.FillRegion([System.Drawing.Brushes]::White, $region1)

  $g.Dispose()
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Icon -Size 192 -Path (Join-Path $root 'icon-192.png') -Padding 0.0
New-Icon -Size 512 -Path (Join-Path $root 'icon-512.png') -Padding 0.0
New-Icon -Size 512 -Path (Join-Path $root 'icon-maskable-512.png') -Padding 0.10
New-Icon -Size 180 -Path (Join-Path $root 'apple-touch-icon.png') -Padding 0.0
New-Icon -Size 32  -Path (Join-Path $root 'favicon-32.png') -Padding 0.0

Write-Host "Icons generated in $root"
