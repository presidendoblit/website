(function(){
    const $ =(sel, root=document) => root.querySelector(sel);
    const $$ =(sel,root=document) => Array.from(root.querySelectorAll(sel));

        // tombol menu
    const menuBtn = $('#menuBtn');
    const nav = $('#primary-nav');
    if (menuBtn && nav){
        menuBtn.addEventListener('click', () =>{
        const open = nav.style.display === 'flex';
        nav.style.display = open ? 'none' : 'flex';
        menuBtn.setAttribute('aria-expanded', String(!open));    
        });
    }
        // menampilkan tahun otomatis
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
        // animasi pertumbuhan
    const demoBar = $('#demoBar'), demoTarget = $('#demoTarget');
    if (demoBar && demoTarget){
        let pct = 35;
        setInterval(()=>{
            pct = (pct + 5) %100;
            demoBar.style.width = pct + '%';
        }, 2500);
    }

    const fmt = new Intl.NumberFormat('id-ID',{style: 'currency', currency: 'IDR', maximumFractionDigits: 0});

        // format budget
    const budgetForm = $ ('#budgetForm');
    const budgetResult = $ ('#budgetResult');
    const saveBudgetBtn = $ ('#saveButget');
    const clearBudgetBtn = $ ('#clearBudget');

        // render hasil perhitungan anggaran
    const renderBudget = (income, savePct) => {
        const save = income * (savePct/100); // tabungan
        const needs = income * 0.5;          // kebutuhan  
        const wants = income - save - needs; // keinginan   
        budgetResult.innerHTML = `
        <div class="grid-2">
        <div class="card">
          <h3>Alokasi</h3>
          <ul>
            <li>💼 Kebutuhan (50%): <strong>${fmt.format(needs)}</strong></li>
            <li>🎉 Keinginan (${(100 - 50 - savePct).toFixed(0)}%): <strong>${fmt.format(wants)}</strong></li>
            <li>💰 Tabungan/Investasi (${savePct}%): <strong>${fmt.format(save)}</strong></li>
          </ul>
        </div>
        <div class="card">
          <h3>Ringkasan</h3>
          <p>Pendapatan: <strong>${fmt.format(income)}</strong></p>
          <div class="progress"><div class="bar" style="width:${Math.min(savePct,100)}%"></div></div>
          <p class="muted">Progres menggambarkan porsi tabungan.</p>
        </div>
      </div>
     `;
    };
    
        // untuk menghitung anggaran
    if (budgetForm){
        budgetForm.addEventListener('submit', (e)=>{
            e.preventDefault();
            const income = Number($('#income').value || 0);
            const savePct = Math.min(100, Math.max(0, Number($('#savePct'). value || 0)));
            if (income <= 0) return alert('Masukan pendapatan bulanan yang valid.');
            renderBudget(income, savePct);
        });
    }
        // menyimpan data ke localstorage
    if (saveBudgetBtn){
        saveBudgetBtn.addEventListener('click', ()=>{
            const income = Number($('#income').value || 0);
            const savePct = Math.min(100, Math.max(0, Number($('#savePct').value || 0)));
            if (income <= 0) return alert('Isi data anggaran lalu klik Simpan');
            localStorage.setItem('finance_budget', JSON.stringify({income,savePct}));
            alert('Rencana anggaran tersimpan di perangkat ini');
        });
    }
        // hapus data dari localstorage
    if (clearBudgetBtn){
        clearBudgetBtn.addEventListener('click', ()=>{
            localStorage.removeItem('finance_budget');
            budgetResult.innerHTML = '';
            alert('Rencana anggaran dihapus');
        });
    }
        // load budget tersimpan saat kembali dibuka 
    const storedBudget = localStorage.getItem('finance_budget');
    if (storedBudget && $('#income')){
        try{
            const{income,savePct} = JSON.parse(storedBudget);
            $('#income').value = income;
            $('#savePct').value = savePct;
            renderBudget(income,savePct);
        }catch{}
    }


    const investForm = $('#investForm');
    const investResult = $('#investResult');

        // menghitung future value dari invest
    const futureValue = (P, PMT, r, years) => {
        const n = 12;
        const i = (r/100)/n;
        const t = years * n;
        const fvLumpsum = P *Math.pow(1+i, t);
        const fvSeries = PMT * ( (Math.pow(1+i, t)-1)/ i );
        return fvLumpsum + fvSeries;
    };
        // menghitung invest
    if (investForm){
        investForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const principal = Number($('#principal').value || 0);
        const monthly = Number($('#monthly').value || 0);
        const rate = Number($('#rate').value || 0);
        const years = Number($('#years').value || 0);
        if (years <= 0 || rate < 0) return alert('Masukkan input yang valid.');
        const fv = futureValue(principal, monthly, rate, years);
        const invested = principal + (monthly * 12 * years);
        const growth = Math.max(0, fv - invested);
        investResult.innerHTML = `
        <div class="grid-2">
          <div class="card">
            <h3>Nilai Akhir</h3>
            <p><strong>${fmt.format(fv)}</strong></p>
            <p class="muted">Total setoran: ${fmt.format(invested)}</p>
          </div>
          <div class="card">
            <h3>Pertumbuhan</h3>
            <p>Keuntungan bunga: <strong>${fmt.format(growth)}</strong></p>
            <div class="progress"><div class="bar" style="width:${Math.min(100, (growth / Math.max(fv,1)) * 100)}%"></div></div>
            <p class="muted">Bar mewakili porsi hasil dari bunga.</p>
          </div>
        </div>
        `;
        });
    }

    const expenseForm = $('#expenseForm');
    const expenseList = $('#expenseList');

         // render data pengeluaran
    const renderExpenses = (items=[]) =>{
        if (!expenseList) return;
        const total = items.reduce((s,x)=> s + x.amount, 0);
        const rows = items.map((x,i)=>`
        <tr>
        <td>${x.category}</td>
        <td>${fmt.format(x.amount)}</td>
        <td><button data-i="${i}" class="btn ghost small">Hapus</button></td>
      </tr>
     `).join('');
     expenseList.innerHTML = `
     <div class="table">
        <table>
          <thead><tr><th>Kategori</th><th>Nominal</th><th>Aksi</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3">Belum ada data.</td></tr>'}</tbody>
          <tfoot><tr><th>Total</th><th>${fmt.format(total)}</th><th></th></tr></tfoot>
        </table>
      </div>
     `;

         // hapus pengeluaran
     $$('#expenseList button[data-i]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            const i = Number(btn.dataset.i);
            items.splice(i,1);
            localStorage.setItem('finance_expenses', JSON.stringify(items));
            renderExpenses(items);
        });
     });
    };

    if (expenseForm){
        const items = JSON.parse(localStorage.getItem('finance_expenses') || '[]');
        renderExpenses(items);

        // tambah pengeluaran
        expenseForm.addEventListener('submit', (e)=>{
            e.preventDefault();
            const category = ($('#expCat').value || '').trim();
            const amount = Number($('#expAmt').value || 0);
            if (!category || amount <= 0) return alert('Isi kategori dan nominal yang valid.');
            items.push({category,amount});
            localStorage.setItem('finance_expenses', JSON.stringify(items));
            $('#expCat').value = ''; $('#expAmt').value='';
            renderExpenses(items);
        });

        // reset pengeluaran
        $('#resetExp').addEventListener('click', ()=>{
            if (confirm('Hapus semua pengeluaran?')){
                localStorage.removeItem('finedu_expenses');
                renderExpenses([]);
            };
        });
    }
})();