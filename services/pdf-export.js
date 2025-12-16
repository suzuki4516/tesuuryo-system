// 各サービスページ用のPDF出力機能

// 価格に割引を適用する
function applyDiscountToPage(discount) {
    if (discount <= 0) return;

    // 処理済みマーカーを使用して二重割引を防止
    const processedMarker = 'data-discount-applied';

    // .price クラスを持つ要素の価格を割引（.no-discountは除外）
    document.querySelectorAll('.price:not(.no-discount)').forEach(priceElement => {
        if (priceElement.hasAttribute(processedMarker)) return;
        const text = priceElement.textContent;
        // 数字とカンマを抽出（例: "8,800円/月" → "8800"）
        const priceMatch = text.match(/([0-9,]+)/);
        if (priceMatch) {
            const originalPrice = parseInt(priceMatch[1].replace(/,/g, ''));
            const discountedPrice = Math.floor(originalPrice * (100 - discount) / 100);
            // 元のフォーマットを維持して置換
            const newText = text.replace(priceMatch[1], discountedPrice.toLocaleString());
            priceElement.textContent = newText;
            priceElement.setAttribute(processedMarker, 'true');
        }
    });

    // USENPAY等の.availableクラスを持つ価格セルにも割引を適用
    document.querySelectorAll('.available:not(.no-discount)').forEach(cell => {
        if (cell.hasAttribute(processedMarker)) return;
        const text = cell.textContent.trim();
        // ¥マークと数字を抽出（例: "¥14,000" → "14000"）
        const priceMatch = text.match(/¥([0-9,]+)/);
        if (priceMatch) {
            const originalPrice = parseInt(priceMatch[1].replace(/,/g, ''));
            const discountedPrice = Math.floor(originalPrice * (100 - discount) / 100);
            cell.textContent = '¥' + discountedPrice.toLocaleString();
            cell.setAttribute(processedMarker, 'true');
        }
    });

    // U-POWERの手数料テーブル内の数値セルにも割引を適用
    // （電灯・動力テーブルのrow-header以外のセル、no-discountは除外、.priceは既に処理済み）
    document.querySelectorAll('.fee-table td:not(.row-header):not(.no-discount):not(.price):not(.available)').forEach(cell => {
        if (cell.hasAttribute(processedMarker)) return;
        const text = cell.textContent.trim();
        // 純粋な数値（整数）のみを対象とする（小数点や%を含むものは除外）
        if (/^[0-9,]+$/.test(text)) {
            const originalPrice = parseInt(text.replace(/,/g, ''));
            if (originalPrice > 0) {
                const discountedPrice = Math.floor(originalPrice * (100 - discount) / 100);
                cell.textContent = discountedPrice.toLocaleString();
                cell.setAttribute(processedMarker, 'true');
            }
        }
    });

    // 「円」を含むテーブルセルにも割引を適用（.priceクラスがないセルも対象）
    // 例: 「240円×9」「3,000円」「1,200円/継続」など
    document.querySelectorAll('.fee-table td:not(.no-discount)').forEach(cell => {
        if (cell.hasAttribute(processedMarker)) return;
        const text = cell.textContent;
        // 「円」を含むが、「%」や既に処理済みでないものを対象
        if (text.includes('円') && !text.includes('%')) {
            // 全ての「数字,数字」+「円」パターンを検索して置換
            const newText = text.replace(/([0-9,]+)円/g, (match, priceStr) => {
                const originalPrice = parseInt(priceStr.replace(/,/g, ''));
                if (originalPrice > 0) {
                    const discountedPrice = Math.floor(originalPrice * (100 - discount) / 100);
                    return discountedPrice.toLocaleString() + '円';
                }
                return match;
            });
            if (newText !== text) {
                cell.textContent = newText;
                cell.setAttribute(processedMarker, 'true');
            }
        }
    });

    // note-box内の「円」を含むテキストにも割引を適用
    document.querySelectorAll('.note-box p, .note-box li, .note-box-blue p, .note-box-blue li, .note-box-red p, .note-box-red li').forEach(element => {
        if (element.hasAttribute(processedMarker)) return;
        if (element.querySelector('span, strong')) {
            // 子要素がある場合は直接テキストノードを処理
            return;
        }
        const text = element.textContent;
        if (text.includes('円') && !text.includes('%')) {
            const newText = text.replace(/([0-9,]+)円/g, (match, priceStr) => {
                const originalPrice = parseInt(priceStr.replace(/,/g, ''));
                if (originalPrice > 0) {
                    const discountedPrice = Math.floor(originalPrice * (100 - discount) / 100);
                    return discountedPrice.toLocaleString() + '円';
                }
                return match;
            });
            if (newText !== text) {
                element.textContent = newText;
                element.setAttribute(processedMarker, 'true');
            }
        }
    });
}

// URLパラメータをチェックして自動PDF出力
function checkAutoExport() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('export') === 'pdf') {
        const discount = parseInt(urlParams.get('discount')) || 0;

        // PDF出力を実行する関数
        function executeExport() {
            setTimeout(function() {
                // 割引を適用
                applyDiscountToPage(discount);

                const serviceName = document.querySelector('.service-title')?.textContent?.replace(' 手数料表', '') || 'service';
                exportPageToPDF(serviceName, true);
            }, 500);
        }

        // ページの読み込み状態をチェック
        if (document.readyState === 'complete') {
            executeExport();
        } else {
            window.addEventListener('load', executeExport);
        }
    }
}

// 自動エクスポートチェックを実行
checkAutoExport();

async function exportPageToPDF(serviceName, autoClose = false) {
    const exportBtn = document.getElementById('pdf-export-btn');
    if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.textContent = 'PDF作成中...';
    }

    try {
        // ページ全体をキャプチャ
        const content = document.querySelector('.service-page');
        if (!content) {
            throw new Error('コンテンツが見つかりません');
        }

        // 戻るリンク、PDFボタン、割引コントロールを一時的に非表示
        const backLink = document.querySelector('.back-link');
        const pdfBtn = document.getElementById('pdf-export-btn');
        const discountControls = document.getElementById('discount-controls');
        if (backLink) backLink.style.display = 'none';
        if (pdfBtn) pdfBtn.style.display = 'none';
        if (discountControls) discountControls.style.display = 'none';

        // html2canvasでキャプチャ
        const canvas = await html2canvas(content, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: content.scrollWidth,
            height: content.scrollHeight
        });

        // 非表示にした要素を元に戻す
        if (backLink) backLink.style.display = '';
        if (pdfBtn) pdfBtn.style.display = '';
        if (discountControls) discountControls.style.display = '';

        // jsPDFでPDF作成
        const { jsPDF } = window.jspdf;
        const imgWidth = 210; // A4幅（mm）
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageHeight = 297; // A4高さ（mm）

        const doc = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;

        // 最初のページ
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // 複数ページ対応
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // PDFを保存
        const filename = `${serviceName}_手数料表.pdf`;

        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 自動エクスポートの場合はウィンドウを閉じる
        if (autoClose) {
            setTimeout(function() {
                window.close();
            }, 1000);
        }

    } catch (error) {
        console.error('PDF生成エラー:', error);
        if (!autoClose) {
            alert('PDF生成中にエラーが発生しました。');
        }
    } finally {
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.textContent = 'このページをPDF出力';
        }
    }
}
