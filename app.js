// サービスデータ（各サービスの手数料情報）
// ※実際の手数料データは後から差し替え可能
const services = [
    {
        id: 'website',
        name: 'Webサイト作成',
        page: 'services/website.html',
        fees: [
            { item: 'BASIC（ページ数:1）', price: 8800 },
            { item: 'STANDARD（ページ数:2〜6）', price: 13800 },
            { item: 'ADVANCE（ページ数:7〜12）', price: 18800 }
        ]
    },
    {
        id: 'websystem',
        name: 'Webシステム作成',
        page: 'services/websystem.html',
        noDiscount: true,
        fees: [
            { item: '手数料', price: 0, note: 'システム費用の20％～' }
        ]
    },
    {
        id: 'u-power',
        name: 'U-POWER',
        page: 'services/u-power.html',
        fees: [
            { item: '電灯手数料', price: 0, note: '明細金額に応じた手数料表参照' },
            { item: '動力手数料', price: 0, note: '契約容量に応じた手数料表参照' }
        ]
    },
    {
        id: 'usen-gas',
        name: 'USENガス',
        page: 'services/usen-gas.html',
        fees: [
            { item: '販売手数料', price: 13500, note: '／口' }
        ]
    },
    {
        id: 'usenhikari',
        name: 'USEN光 plus',
        page: 'services/usenhikari.html',
        fees: [
            { item: '新規手数料', price: 45000 },
            { item: '転用/事業者変更手数料', price: 14000 }
        ]
    },
    {
        id: 'flets_hikari',
        name: 'NTT西日本（フレッツ光）',
        page: 'services/flets-hikari.html',
        fees: [
            { item: '回線手数料', price: 10000, note: '商品により異なる' },
            { item: 'SOHO価格', price: 40000, note: '最大' }
        ]
    },
    {
        id: 'usennet',
        name: 'USEN NET',
        page: 'services/usennet.html',
        fees: [
            { item: 'IPv6-2年割プラン', price: 16000 },
            { item: 'IPv6-3年割プラン', price: 10000 },
            { item: 'サポートplusプラン', price: 19000 }
        ]
    },
    {
        id: 'uspotbiz',
        name: 'U-SPOT biz',
        page: 'services/uspotbiz.html',
        fees: [
            { item: 'パターン1', price: 35000 },
            { item: 'パターン2', price: 23000 },
            { item: 'パターン3', price: 15000 }
        ]
    },
    {
        id: 'kyujin-box',
        name: '求人ボックス',
        page: 'services/kyujin-box.html',
        fees: [
            { item: '求人ボックス', price: 16000 },
            { item: '求人ボックス以外のサービス', price: 8000 }
        ]
    },
    {
        id: 'ubereats',
        name: 'Uber Eats',
        page: 'services/ubereats.html',
        fees: [
            { item: 'Uber Eats HP/LE', price: 92000 },
            { item: '出前館 エリアA', price: 8000 },
            { item: 'Menu 実店舗', price: 40000 }
        ]
    },
    {
        id: 'usen4',
        name: 'トスアップUSEN商材4種',
        page: 'services/usen4.html',
        fees: [
            { item: 'USEN 光plus（新設）', price: 20000 },
            { item: 'USEN MUSIC(Wi-Fi)', price: 9000 },
            { item: 'USEN MUSIC(LTE)', price: 5500 }
        ]
    }
];

// DOM要素
const serviceList = document.getElementById('service-list');
const discountRate = document.getElementById('discount-rate');
const pdfExportBtn = document.getElementById('pdf-export-btn');
const selectAllBtn = document.getElementById('select-all-btn');
const deselectAllBtn = document.getElementById('deselect-all-btn');

// サービス一覧を表示
function renderServiceList() {
    serviceList.innerHTML = '';

    services.forEach(service => {
        const row = document.createElement('tr');
        // ページが設定されている場合は直接リンク、なければモーダル表示
        const linkHref = service.page ? service.page : '#';
        const linkTarget = service.page ? '' : 'data-service-id="' + service.id + '"';

        row.innerHTML = `
            <td class="checkbox-col">
                <input type="checkbox" id="check-${service.id}" data-service-id="${service.id}">
            </td>
            <td>
                <a href="${linkHref}" class="service-link" ${linkTarget}>${service.name}</a>
            </td>
        `;
        serviceList.appendChild(row);
    });

    // ページが設定されていないサービスのみモーダル表示
    document.querySelectorAll('.service-link[data-service-id]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceId = e.target.dataset.serviceId;
            showFeeDetails(serviceId);
        });
    });
}

// 手数料詳細をモーダルで表示
function showFeeDetails(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const discount = parseInt(discountRate.value) || 0;

    // モーダルがなければ作成
    let modal = document.querySelector('.modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    // 手数料テーブルHTML生成
    let tableRows = '';
    service.fees.forEach(fee => {
        const originalPrice = fee.price;
        const discountedPrice = Math.floor(originalPrice * (100 - discount) / 100);
        tableRows += `
            <tr>
                <td>${fee.item}</td>
                <td style="text-align: right;">${originalPrice.toLocaleString()}円</td>
                ${discount > 0 ? `<td style="text-align: right; color: #e74c3c;">${discountedPrice.toLocaleString()}円</td>` : ''}
            </tr>
        `;
    });

    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h2>${service.name} 手数料表</h2>
            ${discount > 0 ? `<p style="color: #e74c3c; margin-top: 10px;">※ ${discount}%割引適用</p>` : ''}
            <table class="fee-table">
                <thead>
                    <tr>
                        <th>項目</th>
                        <th style="text-align: right;">金額</th>
                        ${discount > 0 ? '<th style="text-align: right;">割引後</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;

    modal.classList.add('active');

    // 閉じるボタン
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // モーダル外クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// 選択されたサービスを取得
function getSelectedServices() {
    const selected = [];
    document.querySelectorAll('#service-list input[type="checkbox"]:checked').forEach(checkbox => {
        const serviceId = checkbox.dataset.serviceId;
        const service = services.find(s => s.id === serviceId);
        if (service) selected.push(service);
    });
    return selected;
}

// PDF用のHTMLを生成（単一サービス用）
function createSinglePDFContent(service, discount) {
    const today = new Date().toLocaleDateString('ja-JP');
    // noDiscountがtrueの場合は割引を適用しない
    const effectiveDiscount = service.noDiscount ? 0 : discount;

    let html = `
        <div style="font-family: 'Meiryo', 'Hiragino Sans', sans-serif; padding: 40px; background: white; width: 700px;">
            <h1 style="font-size: 24px; color: #333; border-bottom: 3px solid #4a90d9; padding-bottom: 10px; margin-bottom: 20px;">
                ${service.name} 手数料表
            </h1>
            <p style="color: #666; margin-bottom: 20px;">発行日: ${today}</p>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: #4a90d9; color: white;">
                        <th style="padding: 12px 15px; text-align: left; border: 1px solid #ddd;">項目</th>
                        <th style="padding: 12px 15px; text-align: right; border: 1px solid #ddd;">金額</th>
                    </tr>
                </thead>
                <tbody>
    `;

    service.fees.forEach((fee, index) => {
        const originalPrice = fee.price;
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';

        // 要お見積りの場合はnoteを表示、それ以外は金額を表示
        let priceDisplay;
        if (fee.note) {
            priceDisplay = fee.note;
        } else {
            const displayPrice = effectiveDiscount > 0 ? Math.floor(originalPrice * (100 - effectiveDiscount) / 100) : originalPrice;
            priceDisplay = `${displayPrice.toLocaleString()}円`;
        }

        html += `
            <tr style="background: ${bgColor};">
                <td style="padding: 12px 15px; border: 1px solid #ddd;">${fee.item}</td>
                <td style="padding: 12px 15px; text-align: right; border: 1px solid #ddd;">${priceDisplay}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    return html;
}

// 単一サービスのPDFを生成
async function generateSinglePDF(service, discount, pdfPreview) {
    console.log('PDF生成開始:', service.name);

    // ページが設定されている場合は新しいウィンドウで開いてPDF化
    if (service.page) {
        // ?export=pdf&discount=XX パラメータ付きでページを開く
        // noDiscountフラグがある場合は割引を渡さない
        const effectiveDiscount = service.noDiscount ? 0 : discount;
        const exportUrl = service.page + '?export=pdf&discount=' + effectiveDiscount;
        window.open(exportUrl, '_blank');
        console.log('PDF出力ページを開きました:', exportUrl);
        return;
    }

    // ページが設定されていない場合は従来のPDF生成
    pdfPreview.innerHTML = createSinglePDFContent(service, discount);
    pdfPreview.style.display = 'block';
    pdfPreview.style.position = 'absolute';
    pdfPreview.style.left = '-9999px';
    pdfPreview.style.top = '0';
    await new Promise(resolve => setTimeout(resolve, 100));

    const targetElement = pdfPreview.firstElementChild;
    if (!targetElement) {
        throw new Error('PDF用のコンテンツが見つかりません');
    }

    // html2canvasで画像化
    console.log('html2canvas開始');
    const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: targetElement.scrollWidth,
        height: targetElement.scrollHeight
    });
    console.log('html2canvas完了');

    // jsPDFでPDF作成
    console.log('jsPDF開始');
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

    // PDFを保存（リンク経由でダウンロード）
    const filename = `${service.name}_手数料表.pdf`;
    console.log('PDF保存:', filename);

    // Blobを作成してダウンロード
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    pdfPreview.innerHTML = '';
    console.log('PDF生成完了:', service.name);
}

// PDF生成（各サービスごとに個別のPDFを出力）
async function generatePDF() {
    const selectedServices = getSelectedServices();

    if (selectedServices.length === 0) {
        alert('PDFに出力するサービスを選択してください。');
        return;
    }

    const discount = parseInt(discountRate.value) || 0;
    const pdfPreview = document.getElementById('pdf-preview');

    // ページありとページなしのサービスを分ける
    const servicesWithPage = selectedServices.filter(s => s.page);
    const servicesWithoutPage = selectedServices.filter(s => !s.page);

    // 複数サービスのPDF出力時はポップアップブロッカーの警告
    if (servicesWithPage.length > 1) {
        const confirmMsg = `${servicesWithPage.length}件のPDFを出力します。\n\n` +
            '【重要】ポップアップブロッカーが有効な場合、一部のPDFが出力されない可能性があります。\n\n' +
            'ポップアップがブロックされた場合は、ブラウザのアドレスバー右側にあるブロックアイコンから許可してください。\n\n' +
            '続行しますか？';
        if (!confirm(confirmMsg)) {
            return;
        }
    }

    // ボタンを一時的に無効化
    pdfExportBtn.disabled = true;

    let successCount = 0;
    let blockedCount = 0;

    try {
        // ページがあるサービスは新しいウィンドウで開く
        for (let i = 0; i < servicesWithPage.length; i++) {
            const service = servicesWithPage[i];
            pdfExportBtn.textContent = `PDF作成中... (${i + 1}/${selectedServices.length})`;

            // ウィンドウを開いて、ブロックされたかチェック
            const effectiveDiscount = service.noDiscount ? 0 : discount;
            const exportUrl = service.page + '?export=pdf&discount=' + effectiveDiscount;
            const newWindow = window.open(exportUrl, '_blank');

            if (newWindow === null || typeof newWindow === 'undefined') {
                blockedCount++;
                console.warn('ポップアップがブロックされました:', service.name);
            } else {
                successCount++;
                console.log('PDF出力ページを開きました:', exportUrl);
            }

            // 複数ウィンドウを開く場合は間隔を長めに空ける（2秒）
            if (i < servicesWithPage.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // ページがないサービスは従来のPDF生成
        for (let i = 0; i < servicesWithoutPage.length; i++) {
            const service = servicesWithoutPage[i];
            pdfExportBtn.textContent = `PDF作成中... (${servicesWithPage.length + i + 1}/${selectedServices.length})`;

            await generateSinglePDF(service, discount, pdfPreview);
            successCount++;

            // 複数ファイルダウンロード時の間隔を空ける
            if (i < servicesWithoutPage.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

        // 結果メッセージ
        let resultMsg = '';
        if (blockedCount > 0) {
            resultMsg = `${successCount}件のPDFを出力しました。\n\n` +
                `⚠️ ${blockedCount}件がポップアップブロッカーによりブロックされました。\n` +
                'ブラウザの設定でポップアップを許可してから再度お試しください。';
        } else if (servicesWithPage.length > 0 || servicesWithoutPage.length > 0) {
            resultMsg = `${successCount}件のPDFを出力しました。\n` +
                '各ページでPDFが自動生成されます。ダウンロードフォルダを確認してください。';
        }

        if (resultMsg) {
            alert(resultMsg);
        }

    } catch (error) {
        console.error('PDF生成エラー:', error);
        alert('PDF生成中にエラーが発生しました。');
    } finally {
        // ボタンを元に戻す
        pdfExportBtn.disabled = false;
        pdfExportBtn.textContent = 'PDF作成';
        pdfPreview.style.display = 'none';
    }
}

// 全選択
function selectAll() {
    document.querySelectorAll('#service-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
}

// 全解除
function deselectAll() {
    document.querySelectorAll('#service-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

// イベントリスナー設定
pdfExportBtn.addEventListener('click', generatePDF);
selectAllBtn.addEventListener('click', selectAll);
deselectAllBtn.addEventListener('click', deselectAll);

// 初期化
renderServiceList();
